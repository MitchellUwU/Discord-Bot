import BotClient from '../../../client';
import Builders from '../../../utils/builders';
import Command from '../../../interfaces/command';
import InteractionWrapper from '../../../utils/interactionWrapper';
import * as Lib from 'oceanic.js';

export default class RoleCommand extends Command {
	public override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'role')
		.setDescription('manage role')
		.addOptions([
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'add')
				.setDescription('add role to someone')
				.addOptions([
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('user to add role')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.ROLE, 'role')
						.setDescription('role to give')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('reason that will appear in audit log')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'remove')
				.setDescription('remove role from someone')
				.addOptions([
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('user to remove role')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.ROLE, 'role')
						.setDescription('role to remove')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('reason that will appear in audit log')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'view')
				.setDescription('view all roles')
				.addOption(
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.ROLE, 'role')
						.setDescription('role to view')
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	public async execute(
		client: BotClient,
		interaction: InteractionWrapper
	): Promise<void | Lib.Message<Lib.AnyGuildTextChannel>> {
		if (interaction.user.id !== interaction.guild.ownerID) {
			if (!interaction.member.permissions.has('MANAGE_ROLES')) {
				return interaction.createError({
					content:
						"you need manage roles permission to do that! if you're a moderator, please ask an admin or the owner to give you the permission",
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

				const role = interaction.options.getRole('role', true);
				const reason = interaction.options.getString('reason', false) || 'no reason?';

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createError({ content: `i can't give ${role.name} role to the owner` });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createError({
							content: `${user.tag} have administrator permission, i can't give them roles!`,
						});
					}

					if (
						interaction.getHighestRole(user).position >=
						interaction.getHighestRole(interaction.member).position
					) {
						return interaction.createError({ content: `${user.tag} have higher (or same) role than you` });
					}

					if (role.position >= interaction.getHighestRole(interaction.member).position) {
						return interaction.createError({ content: `${role.name} role is higher (or same) than you` });
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

				if (role.position >= interaction.getHighestRole(interaction.guild.clientMember).position) {
					return interaction.createError({
						content: `${role.name} role is higher (or same) than me, please ask an admin or the owner to fix this`,
					});
				}

				try {
					user.addRole(role.id, reason);
					interaction.createSuccess({ content: `successfully added ${role.name} role to ${user.tag}!` });
				} catch (error: any) {
					interaction.createError({
						content: `i can't add ${role.name} role to ${user.tag} sorry! :(\n\n${error.name}: ${error.message}`,
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

				const role = interaction.options.getRole('role', true);
				const reason = interaction.options.getString('reason', false) || 'no reason?';

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createError({ content: `i can't remove ${role.name} role from the owner` });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createError({
							content: `${user.tag} have administrator permission, i can't remove their roles!`,
						});
					}

					if (
						interaction.getHighestRole(user).position >=
						interaction.getHighestRole(interaction.member).position
					) {
						return interaction.createError({ content: `${user.tag} have higher (or same) role than you` });
					}

					if (role.position >= interaction.getHighestRole(interaction.member).position) {
						return interaction.createError({ content: `${role.name} role is higher (or same) than you` });
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

				if (role.position >= interaction.getHighestRole(interaction.guild.clientMember).position) {
					return interaction.createError({
						content: `${role.name} role is higher (or same) than me, please ask an admin or the owner to fix this`,
					});
				}

				try {
					user.removeRole(role.id, reason);
					interaction.createSuccess({ content: `successfully removed ${role.name} role from ${user.tag}!` });
				} catch (error: any) {
					interaction.createError({
						content: `i can't remove ${role.name} role from ${user.tag} sorry! :(\n\n${error.name}: ${error.message}`,
					});
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'view': {
				const role = interaction.options.getRole('role', false);

				if (!role) {
					const roles: Array<string> = [];

					interaction.guild.roles.forEach((role: Lib.Role) => {
						if (!(role.name == '@everyone')) {
							roles.push(`<@${role.id}>`);
						}
					});

					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setTitle('list of roles')
								.setDescription(roles.join('\n') || 'no role?')
								.setTimestamp()
								.toJSON(),
						],
						flags: 64,
					});
				} else {
					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor({ name: `${role.name} information`, iconURL: interaction.guild.iconURL()! })
								.setDescription(
									[
										`**- name:** ${role.name}`,
										`**- role position:** ${role.position}`,
										`**- creation date:** <t:${Math.floor(role.createdAt.getTime() / 1000)}:f>`,
										`**- managed by integration:** ${role.managed ? 'yes' : 'no'}`,
										`**- id:** ${role.id}`,
									].join('\n')
								)
								.setTimestamp()
								.toJSON(),
						],
						flags: 64,
					});
				}

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
