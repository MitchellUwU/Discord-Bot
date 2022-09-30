import BotClient from '../../../client';
import Builders from '../../../utils/builders';
import Command from '../../../interfaces/command';
import InteractionWrapper from '../../../utils/interactionWrapper';
import * as Lib from 'oceanic.js';
import ms from 'ms';

export default class BanCommand extends Command {
	public override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'ban')
		.setDescription('manage ban')
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

	public async execute(
		client: BotClient,
		interaction: InteractionWrapper
	): Promise<void | Lib.Message<Lib.TextChannel>> {
		if (interaction.user.id !== interaction.guild.ownerID) {
			if (!interaction.member.permissions.has('BAN_MEMBERS')) {
				return interaction.createError({
					content:
						"you need ban members permission to do that! if you're a moderator, please ask an admin or the owner to give you the permission",
				});
			}
		}

		let command = interaction.options.getSubCommand<Lib.SubCommandArray>(false);
		if (!command) command = ['unknown'];

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

				const reason: string = interaction.options.getString('reason', false) || 'no reason?';
				const deleteMessageTime: number = ms(
					`${interaction.options.getString('deleteMessageTime', false) || 0}`
				);

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
						interaction.getHighestRole(user).position >=
						interaction.getHighestRole(interaction.member).position
					) {
						return interaction.createError({ content: `${user.tag} have higher (or same) role than you` });
					}
				}

				if (
					interaction.getHighestRole(user).position >=
					interaction.getHighestRole(interaction.guild.clientMember).position
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

				try {
					const channel: Lib.PrivateChannel = await user.user.createDM();
					message = await channel.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setTitle(`you got banned from ${interaction.guild.name} :(`)
								.setDescription(
									`you broke the rules, didn't you?\n\n**guild name:** ${interaction.guild.name}\n**responsible moderator:** ${interaction.user.tag}\n**reason:** ${reason}\n**time:** no time specified`
								)
								.setTimestamp()
								.toJSON(),
						],
					});
				} catch (error: any) {
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				try {
					await user.ban({
						deleteMessageSeconds: deleteMessageTime / 1000,
						reason: reason,
					});
					interaction.createSuccess({ content: `successfully banned ${user.tag}!` });
				} catch (error: any) {
					message!.delete();
					interaction.createError({
						content: `i can't ban ${user.tag} sorry! :(\n\n${error.name}: ${error.message}`,
					});
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'remove': {
				const user: string = interaction.options.getString('id', true);

				try {
					await interaction.getUser(user);
				} catch (error) {
					return interaction.createError({ content: "that user doesn't exist?" });
				}

				const reason: string = interaction.options.getString('reason', false) || 'no reason?';
				let banned: Lib.Ban;

				try {
					banned = await interaction.guild.getBan(user);
				} catch (error: any) {
					const name = await interaction.getUser(user);
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
					const fetchedMembers: Lib.Ban[] = await interaction.guild.getBans();
					const bannedMembers: string = fetchedMembers
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
						return new Builders.Button(Lib.Constants.ButtonStyles.DANGER, 'unban', 'unban user').setDisabled(
							state
						);
					};

					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor({ name: `${member.user.tag} information`, iconURL: member.user.avatarURL() })
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
						components: [new Builders.ActionRow().addComponent(component(false).toJSON()).toJSON()],
						flags: 64,
					});

					const collector = client.collectors.createNewCollector({
						client: client,
						authorID: interaction.user.id,
						interaction: interaction,
						interactionType: Lib.ComponentInteraction,
						componentType: Lib.Constants.ComponentTypes.BUTTON,
						time: 20000,
						max: 1,
					});

					collector.on('collect', async (i: Lib.ComponentInteraction<Lib.TextChannel>) => {
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
					});

					collector.once('end', async () => {
						interaction.editOriginal({
							components: [new Builders.ActionRow().addComponent(component(true).toJSON()).toJSON()],
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
