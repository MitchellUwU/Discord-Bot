import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import ms from 'ms';
import { dm, errors, others, success } from '../../../locales/main';

export default class TimeoutCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'timeout')
		.setDescription('Manage timeout. Fun fact: This will never appear in the discord client.')
		.setDMPermission(false)
		.setDefaultMemberPermissions('MODERATE_MEMBERS')
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'add')
				.setDescription('Timeout someone.')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('User to timeout.')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'time')
						.setDescription('Duration of time. (Must be between 1 second and 1 week)')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('Reason for timing out.')
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.BOOLEAN, 'dm')
						.setDescription('Whether to dm the user or not. (default to true)')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'remove')
				.setDescription('Untimeout someone.')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('User to untimeout.')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('Reason for untiming out.')
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
						interaction.data.options.getUser('user', true);
						return interaction.createMessage({ content: errors.userNotInGuild });
					} catch (error) {
						return interaction.createMessage({ content: errors.invalidUser });
					}
				}

				const reason = interaction.data.options.getString('reason', false) || others.defaultReason;
				const time = ms(`${interaction.data.options.getString('time', true)}`);
				const dmOption = interaction.data.options.getBoolean('dm', false) ?? true;
				const date = new Date(Date.now() + time).toISOString();

				if (user.id === interaction.user.id) {
					return interaction.createMessage({ content: errors.timeoutActionOnSelf });
				}

				if (user.id === interaction.guild.clientMember.id) {
					return interaction.createMessage({ content: errors.timeoutActionOnBot });
				}

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createMessage({ content: errors.timeoutActionOnOwner });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({ content: errors.timeoutActionOnAdmin });
					}

					if (
						this.client.utils.getHighestRole(user).position >=
						this.client.utils.getHighestRole(interaction.member).position
					) {
						return interaction.createMessage({ content: errors.timeoutActionOnHigherRoleUser });
					}
				}

				if (
					this.client.utils.getHighestRole(user).position >=
					this.client.utils.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createMessage({ content: errors.timeoutActionOnHigherRoleBot });
				}

				if (isNaN(time)) {
					return interaction.createMessage({ content: errors.invalidTime });
				}

				if (time > 604800000 || time < 1000) {
					return interaction.createMessage({ content: errors.timeExceedOrBelowLimitTimeout });
				}

				let message: Lib.Message;
				let dmSuccess = true;

				if (dmOption) {
					try {
						const channel = await user.user.createDM();
						message = await channel.createMessage({ content: dm.timeout(interaction, reason) });
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

					interaction.createMessage({ content: success.timeout(user, dmSuccess) });
				} catch (error) {
					message!.delete().catch();
					interaction.createMessage({ content: errors.cannotTimeout(error) });

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
						interaction.data.options.getUser('user', true);
						return interaction.createMessage({ content: errors.userNotInGuild });
					} catch (error) {
						return interaction.createMessage({ content: errors.invalidUser });
					}
				}

				const reason = interaction.data.options.getString('reason', false) || others.defaultReason;

				if (user.id === interaction.user.id) {
					return interaction.createMessage({ content: errors.untimeoutActionOnSelf });
				}

				if (user.id === interaction.guild.clientMember.id) {
					return interaction.createMessage({ content: errors.untimeoutActionOnBot });
				}

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createMessage({ content: errors.untimeoutActionOnOwner });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({ content: errors.untimeoutActionOnAdmin });
					}

					if (
						this.client.utils.getHighestRole(user).position >=
						this.client.utils.getHighestRole(interaction.member).position
					) {
						return interaction.createMessage({ content: errors.untimeoutActionOnHigherRoleUser });
					}
				}

				if (
					this.client.utils.getHighestRole(user).position >=
					this.client.utils.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createMessage({ content: errors.untimeoutActionOnHigherRoleBot });
				}

				try {
					await user.edit({
						communicationDisabledUntil: new Date(Date.now()).toISOString(),
						reason: reason,
					});
					interaction.createMessage({ content: success.untimeout(user) });
				} catch (error) {
					interaction.createMessage({ content: errors.cannotUntimeout(error) });

					if (error instanceof Error) {
						this.client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
					} else {
						this.client.utils.logger({ title: 'Error', content: error, type: 2 });
					}
				}

				break;
			}
			default: {
				interaction.createMessage({ content: errors.invalidSubcommand, flags: 64 });
			}
		}
	}
}
