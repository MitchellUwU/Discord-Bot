import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import { InteractionCollector } from 'oceanic-collectors';
import * as Lib from 'oceanic.js';
import ms from 'ms';

export default class TimeoutCommand extends Command {
	override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'timeout')
		.setDescription('manage timeout')
		.setDMPermission(false)
		.setDefaultMemberPermissions('MODERATE_MEMBERS')
		.addOptions([
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'add')
				.setDescription('timeout someone')
				.addOptions([
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('user to timeout')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'time')
						.setDescription('duration of time (must be between 1 second and 1 week)')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('why did you timeout the user?')
						.toJSON(),
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.BOOLEAN, 'dm')
						.setDescription('whether to dm the user or not (default to true)')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'remove')
				.setDescription('untimeout someone')
				.addOptions([
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('user to untimeout')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('why did you untimeout the user?')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'view')
				.setDescription('view someone timeout')
				.addOption(
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('user to view timeout')
						.setRequired(true)
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	async execute(client: BotClient, interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		if (interaction.user.id !== interaction.guild.ownerID) {
			if (!interaction.member.permissions.has('MODERATE_MEMBERS')) {
				return interaction.createMessage({
					embeds: [
						Builders.ErrorEmbed()
							.setDescription(
								"you need moderate members permission to do that! if you're a moderator, please ask an admin or the owner to give you the permission"
							)
							.toJSON(),
					],
				});
			}
		}

		const command = interaction.data.options.getSubCommand(true);

		switch (command.toString()) {
			case 'add': {
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
				const time = ms(`${interaction.data.options.getString('time', true)}`);
				let dmOption = interaction.data.options.getBoolean('dm', false);
				const date = new Date(Date.now() + time).toISOString();

				if (dmOption === undefined) dmOption = true;

				if (user.id === interaction.user.id) {
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription("you can't timeout yourself").toJSON()],
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
							embeds: [Builders.ErrorEmbed().setDescription("i can't timeout the owner").toJSON()],
						});
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({
							embeds: [
								Builders.ErrorEmbed()
									.setDescription(`${user.tag} have administrator permission, i can't timeout them!`)
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

				if (isNaN(time)) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription('invalid time! please specify them correctly (example: 5h, 10 minutes etc.)')
								.toJSON(),
						],
					});
				}

				if (time > 604800000 || time < 1000) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed().setDescription('time must be between 1 second and 1 week').toJSON(),
						],
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
									.setTitle(`you got timeout from ${interaction.guild.name} :(`)
									.setDescription(
										`you broke the rules, didn't you?`,
										``,
										`**guild name:** ${interaction.guild.name}`,
										`**responsible moderator:** ${interaction.user.tag}`,
										`**reason:** ${reason}`,
										`**time:** ${ms(time, { long: true })}`
									)
									.setTimestamp()
									.toJSON(),
							],
						});
					} catch (error) {
						dmSuccess = false;
						client.utils.logger({ title: 'Error', content: error, type: 2 });
					}
				}

				try {
					await user.edit({
						communicationDisabledUntil: date,
						reason: reason,
					});

					interaction.createMessage({
						embeds: [
							Builders.SuccessEmbed()
								.setDescription(
									`successfully timeout ${user.tag}!${
										dmOption ? (dmSuccess ? '' : " but i can't dm them") : ''
									}`
								)
								.toJSON(),
						],
					});
				} catch (error: any) {
					message!.delete();
					interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(`i can't timeout that member sorry! :(\n\n${error}`)
								.toJSON(),
						],
					});
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'remove': {
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

				if (user.id === interaction.user.id) {
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription("you can't untimeout yourself").toJSON()],
					});
				}

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription("i can't untimeout the owner").toJSON()],
						});
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({
							embeds: [
								Builders.ErrorEmbed()
									.setDescription(`${user.tag} have administrator permission, i can't untimeout them!`)
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

				try {
					await user.edit({
						communicationDisabledUntil: new Date(Date.now()).toISOString(),
						reason: reason,
					});
					interaction.createMessage({
						embeds: [Builders.SuccessEmbed().setDescription(`successfully untimeout ${user.tag}!`).toJSON()],
					});
				} catch (error: any) {
					interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(`i can't untimeout ${user.tag} sorry! :(\n\n${error}`)
								.toJSON(),
						],
					});
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'view': {
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

				if (!user.communicationDisabledUntil) {
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription(`${user.tag} is not in timeout!`).toJSON()],
					});
				}

				const component = (state: boolean) => {
					return new Builders.ActionRow()
						.addInteractionButton({
							label: 'untimeout user',
							disabled: state,
							customID: 'untimeout',
							style: Lib.ButtonStyles.DANGER,
						})
						.toJSON();
				};

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setAuthor(`${user.tag}'s timeout`, user.avatarURL())
							.setDescription(
								`${user.tag} is timeout until <t:${Math.floor(
									user.communicationDisabledUntil.getTime() / 1000
								)}:f> (in ${ms(user.communicationDisabledUntil.getTime() - Date.now(), {
									long: true,
								})})`
							)
							.setTimestamp()
							.toJSON(),
					],
					components: component(false),
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
					if (i.data.customID === 'untimeout') {
						if (user.id === interaction.user.id) {
							return i.createMessage({
								embeds: [Builders.ErrorEmbed().setDescription("you can't untimeout yourself").toJSON()],
							});
						}

						if (interaction.user.id !== interaction.guild.ownerID) {
							if (user.id === interaction.guild.ownerID) {
								return i.createMessage({
									embeds: [Builders.ErrorEmbed().setDescription("i can't untimeout the owner").toJSON()],
								});
							}

							if (user.permissions.has('ADMINISTRATOR')) {
								return i.createMessage({
									embeds: [
										Builders.ErrorEmbed()
											.setDescription(`${user.tag} have administrator permission, i can't untimeout them!`)
											.toJSON(),
									],
								});
							}

							if (
								client.utils.getHighestRole(user).position >=
								client.utils.getHighestRole(interaction.member).position
							) {
								return i.createMessage({
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
							return i.createMessage({
								embeds: [
									Builders.ErrorEmbed()
										.setDescription(
											`${user.tag} have higher (or same) role than me, please ask an admin or the owner to fix this`
										)
										.toJSON(),
								],
							});
						}

						try {
							await user.edit({
								communicationDisabledUntil: new Date(Date.now()).toISOString(),
								reason: 'untimeout using button in view command',
							});
							i.createMessage({
								embeds: [
									Builders.SuccessEmbed().setDescription(`successfully untimeout ${user.tag}!`).toJSON(),
								],
							});
						} catch (error: any) {
							i.createMessage({
								embeds: [
									Builders.ErrorEmbed()
										.setDescription(`i can't untimeout ${user.tag} sorry! :(\n\n${error}`)
										.toJSON(),
								],
							});
							client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
						}
					}
				});

				collector.once('end', async () => {
					interaction.editOriginal({
						components: component(true),
					});
				});

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
