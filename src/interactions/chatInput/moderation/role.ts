import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import { errors, others, success } from '../../../locales/main';

export default class RoleCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'role')
		.setDescription('Manage role. Fun fact: This will never appear in the discord client.')
		.setDMPermission(false)
		.setDefaultMemberPermissions('MANAGE_ROLES')
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'add')
				.setDescription('Add role to someone.')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('User to add role.')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.ROLE, 'role')
						.setDescription('Role to give.')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('Reason for giving.')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'remove')
				.setDescription('Remove role from someone.')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('User to remove role.')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.ROLE, 'role')
						.setDescription('Role to remove.')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('Reason for removing.')
						.toJSON(),
				])
				.toJSON(),
		])
		.toJSON();

	override userPermission = 'MANAGE_ROLES' as Lib.PermissionName;

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

				const role = interaction.data.options.getRole('role', true);
				const reason = interaction.data.options.getString('reason', false) || others.defaultReason;

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createMessage({ content: errors.addRoleActionOnOwner });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({ content: errors.addRoleActionOnAdmin });
					}

					if (
						this.client.utils.getHighestRole(user).position >=
						this.client.utils.getHighestRole(interaction.member).position
					) {
						return interaction.createMessage({ content: errors.addRoleActionOnHigherRoleUser });
					}

					if (role.position >= this.client.utils.getHighestRole(interaction.member).position) {
						return interaction.createMessage({ content: errors.addRoleActionWithHigherRoleUser });
					}
				}

				if (
					this.client.utils.getHighestRole(user).position >=
					this.client.utils.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createMessage({ content: errors.addRoleActionOnHigherRoleBot });
				}

				if (role.position >= this.client.utils.getHighestRole(interaction.guild.clientMember).position) {
					return interaction.createMessage({ content: errors.addRoleActionWithHigherRoleBot });
				}

				try {
					user.addRole(role.id, reason);
					interaction.createMessage({ content: success.addRole(user, role) });
				} catch (error) {
					interaction.createMessage({ content: errors.cannotAddRole(error) });

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

				const role = interaction.data.options.getRole('role', true);
				const reason = interaction.data.options.getString('reason', false) || others.defaultReason;

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createMessage({ content: errors.removeRoleActionOnOwner });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({ content: errors.removeRoleActionOnAdmin });
					}

					if (
						this.client.utils.getHighestRole(user).position >=
						this.client.utils.getHighestRole(interaction.member).position
					) {
						return interaction.createMessage({ content: errors.removeRoleActionOnHigherRoleUser });
					}

					if (role.position >= this.client.utils.getHighestRole(interaction.member).position) {
						return interaction.createMessage({ content: errors.removeRoleActionWithHigherRoleUser });
					}
				}

				if (
					this.client.utils.getHighestRole(user).position >=
					this.client.utils.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createMessage({ content: errors.removeRoleActionOnHigherRoleBot });
				}

				if (role.position >= this.client.utils.getHighestRole(interaction.guild.clientMember).position) {
					return interaction.createMessage({ content: errors.removeRoleActionWithHigherRoleBot });
				}

				try {
					user.removeRole(role.id, reason);
					interaction.createMessage({ content: success.removeRole(user, role) });
				} catch (error) {
					interaction.createMessage({ content: errors.cannotRemoveRole(error) });

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
