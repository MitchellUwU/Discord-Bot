import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import InteractionWrapper from '../../../classes/InteractionWrapper';
import * as Lib from 'oceanic.js';
import ms from 'ms';
import { ExecuteReturnType } from '../../../types/additional';

export default class BanCommand extends Command {
	override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'ban')
		.setDescription('manage ban')
		.setDMPermission(false)
		.addOptions([
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'add')
				.setDescription('timeout someone')
				.addOptions([
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('user to ban')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('why did you ban the user?')
						.toJSON(),
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'time')
						.setDescription(
							'delete messages in specified duration of time (must be between 1 second and 1 week)'
						)
						.toJSON(),
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.BOOLEAN, 'soft')
						.setDescription('softban the user')
						.toJSON(),
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.BOOLEAN, 'dm')
						.setDescription('dm the user (default to true)')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'remove')
				.setDescription('unban someone')
				.addOptions([
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'id')
						.setDescription('user id to unban')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('why did you unban the user?')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'view')
				.setDescription('view banned members')
				.addOption(
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'id')
						.setDescription('id of banned member (leave empty if you want to view all banned members)')
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	async execute(client: BotClient, interaction: InteractionWrapper): ExecuteReturnType {
		if (interaction.user.id !== interaction.guild.ownerID) {
			if (!interaction.member.permissions.has('BAN_MEMBERS')) {
				return interaction.createError({
					content:
						"you need ban members permission to do that! if you're a moderator, please ask an admin or the owner to give you the permission",
				});
			}
		}

		const command = interaction.options.getSubCommand(true);

		switch (command.toString()) {
			case 'add': {
				let user: Lib.Member;

				try {
					user = interaction.options.getMember('user', true);
				} catch (error) {
					try {
						const name = interaction.options.getUser('user', true).tag;
						return interaction.createError({ content: `${name} is not in this server!` });
					} catch (error) {
						return interaction.createError({ content: "that user doesn't exist?" });
					}
				}

				const reason = interaction.options.getString('reason', false) || 'no reason?';
				const deleteMessageTime = ms(`${interaction.options.getString('deleteMessageTime', false) || 0}`);
				let softOption = interaction.options.getBoolean('soft', false);
				let dmOption = interaction.options.getBoolean('dm', false);

				if (softOption === undefined) softOption = false;
				if (dmOption === undefined) dmOption = true;

				if (user.id === interaction.user.id) {
					return interaction.createError({ content: "you can't ban yourself" });
				}

				if (user.id === interaction.guild.clientMember.id) {
					return interaction.createError({ content: 'T_T' });
				}

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createError({ content: "i can't ban the owner" });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createError({
							content: `${user.tag} have administrator permission, i can't ban them!`,
						});
					}

					if (
						client.utils.getHighestRole(user).position >=
						client.utils.getHighestRole(interaction.member).position
					) {
						return interaction.createError({ content: `${user.tag} have higher (or same) role than you` });
					}
				}

				if (
					client.utils.getHighestRole(user).position >=
					client.utils.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createError({
						content: `${user.tag} have higher (or same) role than me, please ask an admin or the owner to fix this`,
					});
				}

				if (isNaN(deleteMessageTime)) {
					return interaction.createError({
						content: 'invalid time! please specify them correctly (example: 5h, 10 minutes etc.)',
					});
				}

				if (deleteMessageTime > 604800000 || deleteMessageTime < 0) {
					return interaction.createError({ content: 'time must be between 0 and 1 week' });
				}

				let message: Lib.Message;
				let dmSuccess = true;

				if (dmOption) {
					try {
						const channel = await user.user.createDM();
						message = await channel.createMessage({
							embeds: [
								new Builders.Embed()
									.setRandomColor()
									.setTitle(
										`you got ${softOption ? 'softbanned' : 'banned'} from ${interaction.guild.name} :(`
									)
									.setDescription(
										`you broke the rules, didn't you?\n\n**guild name:** ${interaction.guild.name}\n**responsible moderator:** ${interaction.user.tag}\n**reason:** ${reason}\n**time:** no time specified`
									)
									.setTimestamp()
									.toJSON(),
							],
						});
					} catch (error: any) {
						dmSuccess = false;
						client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
					}
				}

				if (softOption) {
					try {
						await user.ban({
							deleteMessageSeconds: deleteMessageTime / 1000,
							reason: reason,
						});
						await interaction.guild.removeBan(user.id, 'softban');

						interaction.createSuccess({
							content: `successfully softbanned ${user.tag}!${
								dmOption ? (dmSuccess ? '' : " but i can't dm them") : ''
							}`,
						});
					} catch (error: any) {
						message!.delete();
						interaction.createError({
							content: `i can't softban ${user.tag} sorry! :(\n\n${error.name}: ${error.message}`,
						});
						client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
					}
				} else {
					try {
						await user.ban({
							deleteMessageSeconds: deleteMessageTime / 1000,
							reason: reason,
						});

						interaction.createSuccess({
							content: `successfully banned ${user.tag}!${
								dmOption ? (dmSuccess ? '' : " but i can't dm them") : ''
							}`,
						});
					} catch (error: any) {
						message!.delete();
						interaction.createError({
							content: `i can't ban ${user.tag} sorry! :(\n\n${error.name}: ${error.message}`,
						});
						client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
					}
				}

				break;
			}
			case 'remove': {
				const user = interaction.options.getString('id', true);

				try {
					await client.utils.getUser(user);
				} catch (error) {
					return interaction.createError({ content: "that user doesn't exist?" });
				}

				const reason = interaction.options.getString('reason', false) || 'no reason?';
				let banned: Lib.Ban;

				try {
					banned = await interaction.guild.getBan(user);
				} catch (error: any) {
					const name = await client.utils.getUser(user);
					return interaction.createError({ content: `${name} is not banned!` });
				}

				try {
					await interaction.guild.removeBan(user, reason);
					interaction.createSuccess({ content: `successfully unbanned ${banned.user.tag}!` });
				} catch (error: any) {
					interaction.createError({
						content: `i can't unban ${banned.user.tag} sorry! :(\n\n${error.name}: ${error.message}`,
					});
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'view': {
				const user = interaction.options.getString('id', false);

				if (!user) {
					const fetchedMembers = await interaction.guild.getBans();
					const bannedMembers = fetchedMembers
						.map(
							(member: Lib.Ban) =>
								`**${member.user.tag} (${member.user.id}) is banned for:** ${member.reason}`
						)
						.join('\n');

					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setTitle('list of banned members')
								.setDescription(bannedMembers || 'no one has been banned yet...')
								.setTimestamp()
								.toJSON(),
						],
						flags: 64,
					});
				} else {
					let member: Lib.Ban;

					try {
						member = await interaction.guild.getBan(user);
					} catch (error: any) {
						try {
							const name = await client.utils.getUser(user);
							return interaction.createError({ content: `${name} is not banned!` });
						} catch (error) {
							return interaction.createError({ content: "that user doesn't exist?" });
						}
					}

					const component = (state: boolean) => {
						return new Builders.ActionRow()
							.addInteractionButton({
								label: 'unban user',
								disabled: state,
								customID: 'unban',
								style: Lib.ButtonStyles.DANGER,
							})
							.toJSON();
					};

					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor(`${member.user.tag} information`, member.user.avatarURL())
								.setDescription(
									[
										`**- name:** ${member.user.tag}`,
										`**- creation date:** <t:${Math.floor(member.user.createdAt.getTime() / 1000)}:f>`,
										`**- is bot:** ${member.user.bot ? 'yes' : 'no'}`,
										`**- is system:** ${member.user.system ? 'yes' : 'no'}`,
										`**- reason for ban:** ${member.reason}`,
										`**- id:** ${member.user.id}`,
									].join('\n')
								)
								.setThumbnail(member.user.avatarURL())
								.setTimestamp()
								.toJSON(),
						],
						components: component(false),
						flags: 64,
					});

					const collector = client.utils.collectors.create({
						client: client,
						authorID: interaction.user.id,
						interaction: interaction,
						interactionType: Lib.ComponentInteraction,
						componentType: Lib.Constants.ComponentTypes.BUTTON,
						time: 20000,
						max: 1,
					});

					collector.on(
						'collect',
						async (i: Lib.ComponentInteraction<Lib.ComponentTypes.BUTTON, Lib.AnyGuildTextChannel>) => {
							if (i.data.customID === 'unban') {
								const helper = new InteractionWrapper(client, i);

								try {
									await interaction.guild.removeBan(user, 'unban using button in view command');
									helper.createSuccess({ content: `successfully unbanned ${member.user.tag}!` });
								} catch (error: any) {
									helper.createError({
										content: `i can't unban ${member.user.tag} sorry! :(\n\n${error.name}: ${error.message}`,
									});
									client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
								}
							}
						}
					);

					collector.once('end', async () => {
						interaction.editOriginal({
							components: component(true),
						});
					});
				}

				break;
			}
			default: {
				interaction.createError({
					content: 'wait for a bit or until the bot restart and try again',
				});
			}
		}
	}
}
