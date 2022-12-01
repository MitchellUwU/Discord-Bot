import type BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';

export default class NicknameCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'nickname')
		.setDescription('manage nickname')
		.setDMPermission(false)
		.setDefaultMemberPermissions('MANAGE_NICKNAMES')
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'change')
				.setDescription('change someone nickname')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('user')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'name')
						.setDescription('name')
						.setRequired(true)
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'remove')
				.setDescription('remove someone nickname')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('user')
						.setRequired(true)
						.toJSON(),
				])
				.toJSON(),
		])
		.toJSON();

	override async execute(client: BotClient, interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		if (interaction.user.id !== interaction.guild.ownerID) {
			if (!interaction.member.permissions.has('MANAGE_NICKNAMES')) {
				return interaction.createMessage({
					embeds: [
						Builders.ErrorEmbed()
							.setDescription(
								"you need manage nicknames permission to do that! if you're a moderator, please ask an admin or the owner to give you the permission"
							)
							.toJSON(),
					],
				});
			}
		}

		const command = interaction.data.options.getSubCommand(true).toString();

		switch (command) {
			case 'change': {
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

				const name = interaction.data.options.getString('name', true);

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription("i can't change the owner nickname").toJSON()],
						});
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({
							embeds: [
								Builders.ErrorEmbed()
									.setDescription(`${user.tag} have administrator permission, i can't change their nickname!`)
									.toJSON(),
							],
						});
					}

					if (
						client.utils.getHighestRole(user).position >=
						client.utils.getHighestRole(interaction.member).position
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
					client.utils.getHighestRole(user).position >=
					client.utils.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(
									`${user.tag} have higher (or same) role than me, please ask an admin or the owner to fix this`
								)
								.toJSON(),
						],
					});
				}

				try {
					user.edit({ nick: name });
					interaction.createMessage({
						embeds: [
							Builders.SuccessEmbed().setDescription(`successfully changed ${user.tag}'s nickname!`).toJSON(),
						],
					});
				} catch (error: any) {
					interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(`i can't change ${user.tag}'s nickname sorry! :(\n\n${error}`)
								.toJSON(),
						],
					});
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
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

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription("i can't remove the owner nickname").toJSON()],
						});
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({
							embeds: [
								Builders.ErrorEmbed()
									.setDescription(`${user.tag} have administrator permission, i can't remove their nickname!`)
									.toJSON(),
							],
						});
					}

					if (
						client.utils.getHighestRole(user).position >=
						client.utils.getHighestRole(interaction.member).position
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
					client.utils.getHighestRole(user).position >=
					client.utils.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(
									`${user.tag} have higher (or same) role than me, please ask an admin or the owner to fix this`
								)
								.toJSON(),
						],
					});
				}

				try {
					user.edit({ nick: '' });
					interaction.createMessage({
						embeds: [
							Builders.SuccessEmbed().setDescription(`successfully removed ${user.tag}'s nickname!`).toJSON(),
						],
					});
				} catch (error: any) {
					interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(`i can't remove ${user.tag}'s nickname sorry! :(\n\n${error}`)
								.toJSON(),
						],
					});
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
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
