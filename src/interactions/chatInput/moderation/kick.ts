import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import { dm, errors, others, success } from '../../../locales/main';

export default class KickCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'kick')
		.setDescription('Kick someone.')
		.setDMPermission(false)
		.setDefaultMemberPermissions('KICK_MEMBERS')
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
				.setDescription('User to kick.')
				.setRequired(true)
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
				.setDescription('Reason for kicking.')
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.BOOLEAN, 'dm')
				.setDescription('Whether to dm the user or not. (default to true)')
				.toJSON(),
		])
		.toJSON();

	override userPermission = 'KICK_MEMBERS' as Lib.PermissionName;

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
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
		const dmOption = interaction.data.options.getBoolean('dm', false) ?? true;

		if (user.id === interaction.user.id) {
			return interaction.createMessage({ content: errors.kickActionOnSelf });
		}

		if (user.id === interaction.guild.clientMember.id) {
			return interaction.createMessage({ content: errors.kickActionOnBot });
		}

		if (interaction.user.id !== interaction.guild.ownerID) {
			if (user.id === interaction.guild.ownerID) {
				return interaction.createMessage({ content: errors.kickActionOnOwner });
			}

			if (user.permissions.has('ADMINISTRATOR')) {
				return interaction.createMessage({ content: errors.kickActionOnAdmin });
			}

			if (
				this.client.utils.getHighestRole(user).position >=
				this.client.utils.getHighestRole(interaction.member).position
			) {
				return interaction.createMessage({ content: errors.kickActionOnHigherRoleUser });
			}
		}

		if (
			this.client.utils.getHighestRole(user).position >=
			this.client.utils.getHighestRole(interaction.guild.clientMember).position
		) {
			return interaction.createMessage({ content: errors.kickActionOnHigherRoleBot });
		}

		let message: Lib.Message;
		let dmSuccess = true;

		if (dmOption) {
			try {
				const channel = await user.user.createDM();
				message = await channel.createMessage({ content: dm.kick(interaction, reason) });
			} catch (error) {
				dmSuccess = false;
				if (error instanceof Error) {
					this.client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				} else {
					this.client.utils.logger({ title: 'Error', content: error, type: 2 });
				}
			}
		}

		try {
			await user.kick(reason);

			interaction.createMessage({ content: success.kick(user, dmSuccess) });
		} catch (error) {
			message!.delete().catch();
			interaction.createMessage({ content: errors.cannotKick(error) });

			if (error instanceof Error) {
				this.client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
			} else {
				this.client.utils.logger({ title: 'Error', content: error, type: 2 });
			}
		}
	}
}
