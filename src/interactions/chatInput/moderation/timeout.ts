import BotClient from '../../../client';
import Builders from '../../../utils/builders';
import Command from '../../../interfaces/command';
import InteractionWrapper from '../../../utils/interactionWrapper';
import * as Lib from 'oceanic.js';
import ms from 'ms';

export default class TimeoutCommand extends Command {
	public override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'timeout')
		.setDescription('manage timeout')
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

	public async execute(
		client: BotClient,
		interaction: InteractionWrapper
	): Promise<void | Lib.Message<Lib.TextChannel>> {
		if (interaction.user.id !== interaction.guild.ownerID) {
			if (!interaction.member.permissions.has('MODERATE_MEMBERS')) {
				return interaction.createError({
					content:
						"you need moderate members permission to do that! if you're a moderator, please ask an admin or the owner to give you the permission",
				});
			}
		}

		let command = interaction.options.getSubCommand(false);
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

				const reason = interaction.options.getString('reason', false) || 'no reason?';
				const time = ms(`${interaction.options.getString('time', true)}`);
				const date = new Date(Date.now() + time).toISOString();

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

				if (isNaN(time)) {
					return interaction.createError({
						content: 'invalid time! please specify them correctly (example: 5h, 10 minutes etc.)',
					});
				}

				if (time > 604800000 || time < 1000) {
					return interaction.createError({ content: 'time must be between 1 second and 1 week' });
				}

				let message: Lib.Message;

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
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				try {
					await user.edit({
						communicationDisabledUntil: date,
						reason: reason,
					});
					interaction.createSuccess({ content: `successfully timeout ${user.tag}!` });
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
					return new Builders.Button(
						Lib.Constants.ButtonStyles.DANGER,
						'untimeout',
						'untimeout user'
					).setDisabled(state);
				};

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setAuthor({ name: `${user.tag}'s timeout`, iconURL: user.avatarURL() })
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
					components: [new Builders.ActionRow().addComponent(component(false).toJSON()).toJSON()],
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
							interaction.getHighestRole(user).position >=
							interaction.getHighestRole(interaction.member).position
						) {
							return helper.createError({ content: `${user.tag} have higher (or same) role than you` });
						}
					}

					if (
						interaction.getHighestRole(user).position >=
						interaction.getHighestRole(interaction.guild.clientMember).position
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
				});

				collector.once('end', async () => {
					interaction.editOriginal({
						components: [new Builders.ActionRow().addComponent(component(true).toJSON()).toJSON()],
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
