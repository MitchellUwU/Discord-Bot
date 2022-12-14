import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';

export default class RoleCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'role')
		.setDescription('manage role')
		.setDMPermission(false)
		.setDefaultMemberPermissions('MANAGE_ROLES')
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'add')
				.setDescription('add role to someone')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('user to add role')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.ROLE, 'role')
						.setDescription('role to give')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('reason that will appear in audit log')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'remove')
				.setDescription('remove role from someone')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('user to remove role')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.ROLE, 'role')
						.setDescription('role to remove')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('reason that will appear in audit log')
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

				const role = interaction.data.options.getRole('role', true);
				const reason = interaction.data.options.getString('reason', false) || 'no reason?';

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createMessage({
							embeds: [
								Builders.ErrorEmbed().setDescription(`i can't give ${role.name} role to the owner`).toJSON(),
							],
						});
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({
							embeds: [
								Builders.ErrorEmbed()
									.setDescription(`${user.tag} have administrator permission, i can't give them roles!`)
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

					if (role.position >= this.client.utils.getHighestRole(interaction.member).position) {
						return interaction.createMessage({
							embeds: [
								Builders.ErrorEmbed()
									.setDescription(`${role.name} role is higher (or same) than you`)
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

				if (role.position >= this.client.utils.getHighestRole(interaction.guild.clientMember).position) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed().setDescription(`${role.name} role is higher (or same) than me`).toJSON(),
						],
					});
				}

				try {
					user.addRole(role.id, reason);
					interaction.createMessage({
						embeds: [
							Builders.SuccessEmbed()
								.setDescription(`successfully added ${role.name} role to ${user.tag}!`)
								.toJSON(),
						],
					});
				} catch (error) {
					interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(`i can't add ${role.name} role to ${user.tag} sorry! :(\n\n${error}`)
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

				const role = interaction.data.options.getRole('role', true);
				const reason = interaction.data.options.getString('reason', false) || 'no reason?';

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createMessage({
							embeds: [
								Builders.ErrorEmbed()
									.setDescription(`i can't remove ${role.name} role from the owner`)
									.toJSON(),
							],
						});
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({
							embeds: [
								Builders.ErrorEmbed()
									.setDescription(`${user.tag} have administrator permission, i can't remove their roles!`)
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

					if (role.position >= this.client.utils.getHighestRole(interaction.member).position) {
						return interaction.createMessage({
							embeds: [
								Builders.ErrorEmbed()
									.setDescription(`${role.name} role is higher (or same) than you`)
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

				if (role.position >= this.client.utils.getHighestRole(interaction.guild.clientMember).position) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed().setDescription(`${role.name} role is higher (or same) than me`).toJSON(),
						],
					});
				}

				try {
					user.removeRole(role.id, reason);
					interaction.createMessage({
						embeds: [
							Builders.SuccessEmbed()
								.setDescription(`successfully removed ${role.name} role from ${user.tag}!`)
								.toJSON(),
						],
					});
				} catch (error) {
					interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(`i can't remove ${role.name} role from ${user.tag} sorry! :(\n\n${error}`)
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
