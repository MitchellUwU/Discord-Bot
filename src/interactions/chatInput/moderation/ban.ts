import type BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import { InteractionCollector } from 'oceanic-collectors';
import * as Lib from 'oceanic.js';
import ms from 'ms';

export default class BanCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'ban')
		.setDescription('manage ban')
		.setDMPermission(false)
		.setDefaultMemberPermissions('BAN_MEMBERS')
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'add')
				.setDescription('timeout someone')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('user to ban')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('why did you ban the user?')
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'time')
						.setDescription(
							'delete messages in specified duration of time (must be between 1 second and 1 week)'
						)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.BOOLEAN, 'soft')
						.setDescription('whether to softban the user or not')
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.BOOLEAN, 'dm')
						.setDescription('whether to dm the user or not (default to true)')
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.BOOLEAN, 'force')
						.setDescription(
							`whether to force ban the user or not (this setting makes "soft" and "dm" option useless)`
						)
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'remove')
				.setDescription('unban someone')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'id')
						.setDescription('user id to unban')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('why did you unban the user?')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'view')
				.setDescription('view banned members')
				.addOption(
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'id')
						.setDescription('id of banned member (leave empty if you want to view all banned members)')
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	override async execute(client: BotClient, interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		if (interaction.user.id !== interaction.guild.ownerID) {
			if (!interaction.member.permissions.has('BAN_MEMBERS')) {
				return interaction.createMessage({
					embeds: [
						Builders.ErrorEmbed()
							.setDescription(
								"you need ban members permission to do that! if you're a moderator, please ask an admin or the owner to give you the permission"
							)
							.toJSON(),
					],
				});
			}
		}

		const command = interaction.data.options.getSubCommand(true).toString();

		switch (command) {
			case 'add': {
				let forceOption = interaction.data.options.getBoolean('force', false);
				if (forceOption === undefined) forceOption = false;

				if (forceOption) {
					let user: Lib.User;

					try {
						user = interaction.data.options.getUser('user', true);
					} catch (error) {
						return interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription("that user doesn't exist?").toJSON()],
						});
					}

					let valid: boolean;

					try {
						await client.utils.getMember(interaction.guildID, user.id);
						valid = false;
					} catch (error) {
						valid = true;
					}

					const reason = interaction.data.options.getString('reason', false) || 'no reason?';
					const deleteMessageTime = ms(
						`${interaction.data.options.getString('deleteMessageTime', false) || 0}`
					);

					if (user.id === interaction.user.id) {
						return interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription("you can't ban yourself").toJSON()],
						});
					}

					if (user.id === interaction.guild.clientMember.id) {
						return interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription('T_T').toJSON()],
						});
					}

					if (!valid) {
						return interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription('that user is already in the guild').toJSON()],
						});
					}

					try {
						await interaction.guild.createBan(user.id, {
							deleteMessageSeconds: deleteMessageTime / 1000,
							reason: reason,
						});

						interaction.createMessage({
							embeds: [Builders.SuccessEmbed().setDescription(`successfully banned ${user.tag}!`).toJSON()],
						});
					} catch (error) {
						interaction.createMessage({
							embeds: [
								Builders.ErrorEmbed()
									.setDescription(`i can't ban ${user.tag} sorry! :(\n\n${error}`)
									.toJSON(),
							],
						});

						if (error instanceof Error) {
							client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
						} else {
							client.utils.logger({ title: 'Error', content: error, type: 2 });
						}
					}
				} else {
					let user: Lib.Member;

					try {
						user = interaction.data.options.getMember('user', true);
					} catch (error) {
						try {
							const name = interaction.data.options.getUser('user', true).tag;
							return interaction.createMessage({
								embeds: [Builders.ErrorEmbed().setDescription(`${name} is not in this server!`).toJSON()],
							});
						} catch (error) {
							return interaction.createMessage({
								embeds: [Builders.ErrorEmbed().setDescription("that user doesn't exist?").toJSON()],
							});
						}
					}

					const reason = interaction.data.options.getString('reason', false) || 'no reason?';
					const deleteMessageTime = ms(
						`${interaction.data.options.getString('deleteMessageTime', false) || 0}`
					);
					let softOption = interaction.data.options.getBoolean('soft', false);
					let dmOption = interaction.data.options.getBoolean('dm', false);

					if (softOption === undefined) softOption = false;
					if (dmOption === undefined) dmOption = true;

					if (user.id === interaction.user.id) {
						return interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription("you can't ban yourself").toJSON()],
						});
					}

					if (user.id === interaction.guild.clientMember.id) {
						return interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription('T_T').toJSON()],
						});
					}

					if (interaction.user.id !== interaction.guild.ownerID) {
						if (user.id === interaction.guild.ownerID) {
							return interaction.createMessage({
								embeds: [Builders.ErrorEmbed().setDescription("i can't ban the owner").toJSON()],
							});
						}

						if (user.permissions.has('ADMINISTRATOR')) {
							return interaction.createMessage({
								embeds: [
									Builders.ErrorEmbed()
										.setDescription(`${user.tag} have administrator permission, i can't ban them!`)
										.toJSON(),
								],
							});
						}

						if (
							client.utils.getHighestRole(user).position >=
							client.utils.getHighestRole(interaction.member).position
						) {
							return interaction.createMessage({
								embeds: [
									Builders.ErrorEmbed()
										.setDescription(`${user.tag} have higher (or same) role than you`)
										.toJSON(),
								],
							});
						}
					}

					if (
						client.utils.getHighestRole(user).position >=
						client.utils.getHighestRole(interaction.guild.clientMember).position
					) {
						return interaction.createMessage({
							embeds: [
								Builders.ErrorEmbed()
									.setDescription(
										`${user.tag} have higher (or same) role than me, please ask an admin or the owner to fix this`
									)
									.toJSON(),
							],
						});
					}

					if (isNaN(deleteMessageTime)) {
						return interaction.createMessage({
							embeds: [
								Builders.ErrorEmbed()
									.setDescription(
										'invalid time! please specify them correctly (example: 5h, 10 minutes etc.)'
									)
									.toJSON(),
							],
						});
					}

					if (deleteMessageTime > 604800000 || deleteMessageTime < 0) {
						return interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription('time must be between 0 and 1 week').toJSON()],
						});
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
											`you broke the rules, didn't you?`,
											``,
											`**guild name:** ${interaction.guild.name}`,
											`**responsible moderator:** ${interaction.user.tag}`,
											`**reason:** ${reason}`
										)
										.setTimestamp()
										.toJSON(),
								],
							});
						} catch (error) {
							dmSuccess = false;
							if (error instanceof Error) {
								client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
							} else {
								client.utils.logger({ title: 'Error', content: error, type: 2 });
							}
						}
					}

					if (softOption) {
						try {
							await user.ban({
								deleteMessageSeconds: deleteMessageTime / 1000,
								reason: reason,
							});
							await interaction.guild.removeBan(user.id, 'softban');

							interaction.createMessage({
								embeds: [
									Builders.SuccessEmbed()
										.setDescription(
											`successfully softbanned ${user.tag}!${
												dmOption ? (dmSuccess ? '' : " but i can't dm them") : ''
											}`
										)
										.toJSON(),
								],
							});
						} catch (error) {
							message!.delete();
							interaction.createMessage({
								embeds: [
									Builders.SuccessEmbed()
										.setDescription(`i can't softban ${user.tag} sorry! :(\n\n${error}`)
										.toJSON(),
								],
							});

							if (error instanceof Error) {
								client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
							} else {
								client.utils.logger({ title: 'Error', content: error, type: 2 });
							}
						}
					} else {
						try {
							await user.ban({
								deleteMessageSeconds: deleteMessageTime / 1000,
								reason: reason,
							});

							interaction.createMessage({
								embeds: [
									Builders.SuccessEmbed()
										.setDescription(
											`successfully banned ${user.tag}!${
												dmOption ? (dmSuccess ? '' : " but i can't dm them") : ''
											}`
										)
										.toJSON(),
								],
							});
						} catch (error) {
							message!.delete();
							interaction.createMessage({
								embeds: [
									Builders.ErrorEmbed()
										.setDescription(`i can't ban ${user.tag} sorry! :(\n\n${error}`)
										.toJSON(),
								],
							});

							if (error instanceof Error) {
								client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
							} else {
								client.utils.logger({ title: 'Error', content: error, type: 2 });
							}
						}
					}
				}

				break;
			}
			case 'remove': {
				const user = interaction.data.options.getString('id', true);

				try {
					await client.utils.getUser(user);
				} catch (error) {
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription("that user doesn't exist?").toJSON()],
					});
				}

				const reason = interaction.data.options.getString('reason', false) || 'no reason?';
				let banned: Lib.Ban;

				try {
					banned = await interaction.guild.getBan(user);
				} catch (error) {
					const name = await client.utils.getUser(user);
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription(`${name} is not banned!`).toJSON()],
					});
				}

				try {
					await interaction.guild.removeBan(user, reason);
					interaction.createMessage({
						embeds: [
							Builders.SuccessEmbed().setDescription(`successfully unbanned ${banned.user.tag}!`).toJSON(),
						],
					});
				} catch (error) {
					interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(`i can't unban ${banned.user.tag} sorry! :(\n\n${error}`)
								.toJSON(),
						],
					});

					if (error instanceof Error) {
						client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
					} else {
						client.utils.logger({ title: 'Error', content: error, type: 2 });
					}
				}

				break;
			}
			case 'view': {
				const user = interaction.data.options.getString('id', false);

				if (!user) {
					const fetchedMembers = await interaction.guild.getBans();
					const bannedMembers = fetchedMembers
						.map((member: Lib.Ban) => {
							return `**${member.user.tag} (${member.user.id}) is banned for:** ${member.reason}`;
						})
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
					} catch (error) {
						try {
							const name = await client.utils.getUser(user);
							return interaction.createMessage({
								embeds: [Builders.ErrorEmbed().setDescription(`${name} is not banned!`).toJSON()],
							});
						} catch (error) {
							return interaction.createMessage({
								embeds: [Builders.ErrorEmbed().setDescription("that user doesn't exist?").toJSON()],
							});
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
							.addURLButton({ label: 'avatar url', url: member.user.avatarURL() })
							.toJSON();
					};

					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor(`${member.user.tag} information`, member.user.avatarURL())
								.setDescription(
									`**- name:** ${member.user.tag}`,
									`**- creation date:** <t:${Math.floor(member.user.createdAt.getTime() / 1000)}:f>`,
									`**- is bot:** ${member.user.bot ? 'yes' : 'no'}`,
									`**- is system:** ${member.user.system ? 'yes' : 'no'}`,
									`**- reason for ban:** ${member.reason}`,
									`**- id:** ${member.user.id}`
								)
								.setThumbnail(member.user.avatarURL())
								.setTimestamp()
								.toJSON(),
						],
						components: component(false),
						flags: 64,
					});

					const collector = new InteractionCollector<
						Lib.InteractionTypes.MESSAGE_COMPONENT,
						Lib.ComponentTypes.BUTTON
					>(client, {
						interaction: interaction,
						filter: (i) => i.user.id === interaction.user.id,
						time: 20000,
						max: 1,
					});

					collector.on('collect', async (i) => {
						if (!i.inCachedGuildChannel()) return collector.stop();
						if (i.data.customID === 'unban') {
							try {
								await interaction.guild.removeBan(user, 'unban using button in view command');
								i.createMessage({
									embeds: [
										Builders.SuccessEmbed()
											.setDescription(`successfully unbanned ${member.user.tag}!`)
											.toJSON(),
									],
								});
							} catch (error) {
								i.createMessage({
									embeds: [
										Builders.ErrorEmbed()
											.setDescription(`i can't unban ${member.user.tag} sorry! :(\n\n${error}`)
											.toJSON(),
									],
								});

								if (error instanceof Error) {
									client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
								} else {
									client.utils.logger({ title: 'Error', content: error, type: 2 });
								}
							}
						}
					});

					collector.once('end', async () => {
						interaction.editOriginal({
							components: component(true),
						});
					});
				}

				break;
			}
			default: {
				interaction.createMessage({
					embeds: [
						Builders.ErrorEmbed()
							.setDescription('wait for a bit or until the bot restart and try again')
							.toJSON(),
					],
				});
			}
		}
	}
}
