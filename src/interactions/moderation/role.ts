import { ApplicationCommandType, ApplicationCommandOptionType, TextInputStyle } from 'discord-api-types/v10';
import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import CommandInterface from '../../interfaces/command';
import InteractionWrapper from '../../utils/interactionWrapper';
import * as Lib from 'oceanic.js';

export default class RoleCommand extends CommandInterface {
	public override data = new Builders.Command(ApplicationCommandType.ChatInput, 'role')
		.setDescription('manage role')
		.addOptions([
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'add')
				.setDescription('add role to someone')
				.addOptions([
					new Builders.Option(ApplicationCommandOptionType.User, 'user')
						.setDescription('user to add role')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(ApplicationCommandOptionType.Role, 'role')
						.setDescription('role to give')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(ApplicationCommandOptionType.String, 'reason')
						.setDescription('reason that will appear in audit log')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'remove')
				.setDescription('remove role from someone')
				.addOptions([
					new Builders.Option(ApplicationCommandOptionType.User, 'user')
						.setDescription('user to remove role')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(ApplicationCommandOptionType.Role, 'role')
						.setDescription('role to remove')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(ApplicationCommandOptionType.String, 'reason')
						.setDescription('reason that will appear in audit log')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'view')
				.setDescription('view all roles')
				.addOption(
					new Builders.Option(ApplicationCommandOptionType.Role, 'role')
						.setDescription('role to view')
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	public async execute(client: BotClient, interaction: InteractionWrapper): Promise<void> {
		let command = interaction.options.getSubCommand<Lib.SubCommandArray>(false);
		if (!command) command = ['unknown'];

		switch (command.toString()) {
			case 'add': {
				const user: Lib.Member = interaction.options.getMember('user', true);
				const role: Lib.Role = interaction.options.getRole('role', true);
				const reason: string = interaction.options.getString('reason', false) || 'no reason?';

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (!interaction.member.permissions.has('MANAGE_ROLES')) {
						return interaction.createError({ content: 'you need manage roles permission to do that...' });
					}

					if (user.id === interaction.guild.ownerID) {
						return interaction.createError({ content: "i can't add the role to the owner" });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createError({
							content: "i can't add the role to the user with administrator permission",
						});
					}

					if (
						interaction.getHighestRole(user).position >=
						interaction.getHighestRole(interaction.member).position
					) {
						return interaction.createError({ content: 'that user has higher/same role than you' });
					}

					if (
						interaction.getHighestRole(user).position >=
						interaction.getHighestRole(interaction.guild.clientMember).position
					) {
						return interaction.createError({ content: 'that user has higher/same role than me' });
					}

					if (role.position >= interaction.getHighestRole(interaction.member).position) {
						return interaction.createError({ content: 'that role is higher/same role than you' });
					}
				}

				if (
					interaction.getHighestRole(user).position >=
					interaction.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createError({ content: 'that user has higher/same role than me' });
				}

				if (role.position >= interaction.getHighestRole(interaction.guild.clientMember).position) {
					return interaction.createError({ content: 'that role is higher/same role than me' });
				}

				try {
					user.addRole(role.id, reason);
					interaction.createSuccess({ content: 'successfully added the role to the member!' });
				} catch (error: any) {
					interaction.createError({ content: "i can't add that role to the member sorry! :(" });
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'remove': {
				const user: Lib.Member = interaction.options.getMember('user', true);
				const role: Lib.Role = interaction.options.getRole('role', true);
				const reason: string = interaction.options.getString('reason', false) || 'no reason?';

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (!interaction.member.permissions.has('MANAGE_ROLES')) {
						return interaction.createError({ content: 'you need manage roles permission to do that...' });
					}

					if (user.id === interaction.guild.ownerID) {
						return interaction.createError({ content: "i can't remove the role from the owner" });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createError({
							content: "i can't remove the role from the user with administrator permission",
						});
					}

					if (
						interaction.getHighestRole(user).position >=
						interaction.getHighestRole(interaction.member).position
					) {
						return interaction.createError({ content: 'that user has higher/same role than you' });
					}

					if (role.position >= interaction.getHighestRole(interaction.member).position) {
						return interaction.createError({ content: 'that role is higher/same role than you' });
					}
				}

				if (
					interaction.getHighestRole(user).position >=
					interaction.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createError({ content: 'that user has higher/same role than me' });
				}

				if (role.position >= interaction.getHighestRole(interaction.guild.clientMember).position) {
					return interaction.createError({ content: 'that role is higher/same role than me' });
				}

				try {
					user.removeRole(role.id, reason);
					interaction.createSuccess({ content: 'successfully removed the role to the member!' });
				} catch (error: any) {
					interaction.createError({ content: "i can't remove that role from the member sorry! :(" });
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'view': {
				const role: Lib.Role | undefined = interaction.options.getRole('role', false);

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (!interaction.member.permissions.has('MANAGE_ROLES')) {
						return interaction.createError({ content: 'you need manage roles permission to do that...' });
					}
				}

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
				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setTitle('wait...')
							.setDescription(
								'how did you get here? use the command properly! you are not supposed to be here, go away!'
							)
							.setTimestamp()
							.toJSON(),
					],
					flags: 64,
				});
			}
		}
	}
}
