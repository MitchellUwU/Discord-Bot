import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import InteractionWrapper from '../../../classes/InteractionWrapper';
import * as Lib from 'oceanic.js';
import ms from 'ms';

export default class TimeoutCommand extends Command {
	override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'timeout')
		.setDescription('manage timeout')
		.setDMPermission(false)
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
						.setDescription('dm the user (default to true)')
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

	async execute(client: BotClient, interaction: InteractionWrapper) {
		if (interaction.user.id !== interaction.guild.ownerID) {
			if (!interaction.member.permissions.has('MODERATE_MEMBERS')) {
				return interaction.createError({
					content:
						"you need moderate members permission to do that! if you're a moderator, please ask an admin or the owner to give you the permission",
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
				const time = ms(`${interaction.options.getString('time', true)}`);
				let dmOption = interaction.options.getBoolean('dm', false);
				const date = new Date(Date.now() + time).toISOString();

				if (dmOption === undefined) dmOption = true;

				if (user.id === interaction.user.id) {
					return interaction.createError({ content: "you can't timeout yourself" });
				}

				if (user.id === interaction.guild.clientMember.id) {
					return interaction.createError({ content: 'T_T' });
				}

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createError({ content: "i can't timeout the owner" });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createError({
							content: `${user.tag} have administrator permission, i can't timeout them!`,
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

				if (isNaN(time)) {
					return interaction.createError({
						content: 'invalid time! please specify them correctly (example: 5h, 10 minutes etc.)',
					});
				}

				if (time > 604800000 || time < 1000) {
					return interaction.createError({ content: 'time must be between 1 second and 1 week' });
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
										`you broke the rules, didn't you?\n\n**guild name:** ${
											interaction.guild.name
										}\n**responsible moderator:** ${
											interaction.user.tag
										}\n**reason:** ${reason}\n**time:** ${ms(time, { long: true })}`
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

				try {
					await user.edit({
						communicationDisabledUntil: date,
						reason: reason,
					});

					interaction.createSuccess({
						content: `successfully timeout ${user.tag}!${
							dmOption ? (dmSuccess ? '' : " but i can't dm them") : ''
						}`,
					});
				} catch (error: any) {
					message!.delete();
					interaction.createError({
						content: `i can't timeout that member sorry! :(\n\n${error.name}: ${error.message}`,
					});
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'remove': {
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

				if (user.id === interaction.user.id) {
					return interaction.createError({ content: "you can't untimeout yourself" });
				}

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createError({ content: "i can't untimeout the owner" });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createError({
							content: `${user.tag} have administrator permission, i can't untimeout them!`,
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

				try {
					await user.edit({
						communicationDisabledUntil: new Date(Date.now()).toISOString(),
						reason: reason,
					});
					interaction.createSuccess({ content: `successfully untimeout ${user.tag}!` });
				} catch (error: any) {
					interaction.createError({
						content: `i can't untimeout ${user.tag} sorry! :(\n\n${error.name}: ${error.message}`,
					});
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'view': {
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

				if (!user.communicationDisabledUntil) {
					return interaction.createError({
						content: `${user.tag} is not in timeout!`,
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
						if (i.data.customID === 'untimeout') {
							const helper = new InteractionWrapper(client, i);

							if (user.id === interaction.user.id) {
								return helper.createError({ content: "you can't untimeout yourself" });
							}

							if (interaction.user.id !== interaction.guild.ownerID) {
								if (user.id === interaction.guild.ownerID) {
									return helper.createError({ content: "i can't untimeout the owner" });
								}

								if (user.permissions.has('ADMINISTRATOR')) {
									return helper.createError({
										content: `${user.tag} have administrator permission, i can't untimeout them!`,
									});
								}

								if (
									client.utils.getHighestRole(user).position >=
									client.utils.getHighestRole(interaction.member).position
								) {
									return helper.createError({ content: `${user.tag} have higher (or same) role than you` });
								}
							}

							if (
								client.utils.getHighestRole(user).position >=
								client.utils.getHighestRole(interaction.guild.clientMember).position
							) {
								return helper.createError({
									content: `${user.tag} have higher (or same) role than me, please ask an admin or the owner to fix this`,
								});
							}

							try {
								await user.edit({
									communicationDisabledUntil: new Date(Date.now()).toISOString(),
									reason: 'untimeout using button in view command',
								});
								helper.createSuccess({ content: `successfully untimeout ${user.tag}!` });
							} catch (error: any) {
								helper.createError({
									content: `i can't untimeout ${user.tag} sorry! :(\n\n${error.name}: ${error.message}`,
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
