import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import ms from 'ms';

export default class TimeoutCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'timeout')
		.setDescription('manage timeout')
		.setDMPermission(false)
		.setDefaultMemberPermissions('MODERATE_MEMBERS')
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'add')
				.setDescription('timeout someone')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('user to timeout')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'time')
						.setDescription('duration of time (must be between 1 second and 1 week)')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('why did you timeout the user?')
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.BOOLEAN, 'dm')
						.setDescription('whether to dm the user or not (default to true)')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'remove')
				.setDescription('untimeout someone')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('user to untimeout')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('why did you untimeout the user?')
						.toJSON(),
				])
				.toJSON(),
		])
		.toJSON();

	override userPermission = 'MODERATE_MEMBERS' as Lib.PermissionName;

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		const command = interaction.data.options.getSubCommand(true).toString();

		switch (command) {
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
						this.client.utils.getHighestRole(user).position >=
						this.client.utils.getHighestRole(interaction.member).position
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
					this.client.utils.getHighestRole(user).position >=
					this.client.utils.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed().setDescription(`${user.tag} have higher (or same) role than me`).toJSON(),
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
						this.client.utils.logger({ title: 'Error', content: error, type: 2 });
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
				} catch (error) {
					message!.delete();
					interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(`i can't timeout that member sorry! :(\n\n${error}`)
								.toJSON(),
						],
					});

					if (error instanceof Error) {
						this.client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
					} else {
						this.client.utils.logger({ title: 'Error', content: error, type: 2 });
					}
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
						this.client.utils.getHighestRole(user).position >=
						this.client.utils.getHighestRole(interaction.member).position
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
					this.client.utils.getHighestRole(user).position >=
					this.client.utils.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed().setDescription(`${user.tag} have higher (or same) role than me`).toJSON(),
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
				} catch (error) {
					interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(`i can't untimeout ${user.tag} sorry! :(\n\n${error}`)
								.toJSON(),
						],
					});

					if (error instanceof Error) {
						this.client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
					} else {
						this.client.utils.logger({ title: 'Error', content: error, type: 2 });
					}
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
