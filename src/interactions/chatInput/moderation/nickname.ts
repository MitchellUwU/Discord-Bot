import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import { errors, success } from '../../../locales/main';

export default class NicknameCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'nickname')
		.setDescription('Manage nickname. Fun fact: This will never appear in the discord client.')
		.setDMPermission(false)
		.setDefaultMemberPermissions('MANAGE_NICKNAMES')
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'change')
				.setDescription('Change someone nickname.')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('User to change nickname.')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'name')
						.setDescription('New nickname.')
						.setRequired(true)
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'remove')
				.setDescription('Remove someone nickname.')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('User to remove nickname.')
						.setRequired(true)
						.toJSON(),
				])
				.toJSON(),
		])
		.toJSON();

	override userPermission = 'MANAGE_NICKNAMES' as Lib.PermissionName;

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		const command = interaction.data.options.getSubCommand(true).toString();

		switch (command) {
			case 'change': {
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

				const name = interaction.data.options.getString('name', true);

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createMessage({ content: errors.changeNickActionOnOwner });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({ content: errors.changeNickActionOnAdmin });
					}

					if (
						this.client.utils.getHighestRole(user).position >=
						this.client.utils.getHighestRole(interaction.member).position
					) {
						return interaction.createMessage({ content: errors.changeNickActionOnHigherRoleUser });
					}
				}

				if (
					this.client.utils.getHighestRole(user).position >=
					this.client.utils.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createMessage({ content: errors.changeNickActionOnHigherRoleBot });
				}

				try {
					user.edit({ nick: name });
					interaction.createMessage({ content: success.changeNick(user) });
				} catch (error) {
					interaction.createMessage({ content: errors.cannotChangeNick(error) });

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

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createMessage({ content: errors.removeNickActionOnOwner });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({ content: errors.removeNickActionOnAdmin });
					}

					if (
						this.client.utils.getHighestRole(user).position >=
						this.client.utils.getHighestRole(interaction.member).position
					) {
						return interaction.createMessage({ content: errors.removeNickActionOnHigherRoleUser });
					}
				}

				if (
					this.client.utils.getHighestRole(user).position >=
					this.client.utils.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createMessage({ content: errors.removeNickActionOnHigherRoleBot });
				}

				try {
					user.edit({ nick: '' });
					interaction.createMessage({ content: success.removeNick(user) });
				} catch (error) {
					interaction.createMessage({ content: errors.cannotRemoveNick(error) });

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
