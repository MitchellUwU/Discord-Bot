import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord-api-types/v10';
import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import CommandInterface from '../../interfaces/command';
import * as Lib from 'oceanic.js';
import InteractionWrapper from '../../utils/interactionWrapper';

export default class NicknameCommand extends CommandInterface {
	public override data = new Builders.Command(ApplicationCommandType.ChatInput, 'nickname')
		.setDescription('manage nickname')
		.addOptions([
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'change')
				.setDescription('change someone nickname')
				.addOptions([
					new Builders.Option(ApplicationCommandOptionType.User, 'user')
						.setDescription('user')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(ApplicationCommandOptionType.String, 'name')
						.setDescription('name')
						.setRequired(true)
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'remove')
				.setDescription('remove someone nickname')
				.addOptions([
					new Builders.Option(ApplicationCommandOptionType.User, 'user')
						.setDescription('user')
						.setRequired(true)
						.toJSON(),
				])
				.toJSON(),
		])
		.toJSON();

	public async execute(
		client: BotClient,
		interaction: InteractionWrapper
	): Promise<void | Lib.Message<Lib.TextChannel>> {
		let command = interaction.options.getSubCommand<Lib.SubCommandArray>(false);
		if (!command) command = ['unknown'];

		switch (command.toString()) {
			case 'change': {
				const user: Lib.Member = interaction.options.getMember('user', true);
				const name: string = interaction.options.getString('name', true);

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (!interaction.member.permissions.has('MANAGE_NICKNAMES')) {
						return interaction.createError({ content: 'you need manage nicknames permission to do that...' });
					}

					if (user.id === interaction.guild.ownerID) {
						return interaction.createError({ content: `i can't change/remove the owner nickname` });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createError({
							content: `i can't change/remove user nickname that has administrator permission`,
						});
					}

					if (
						interaction.getHighestRole(user).position >=
						interaction.getHighestRole(interaction.member).position
					) {
						return interaction.createError({ content: 'that user has higher/same role than you' });
					}
				}

				if (
					interaction.getHighestRole(user).position >=
					interaction.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createError({ content: 'that user has higher/same role than me' });
				}

				try {
					user.edit({ nick: name });
					interaction.createSuccess({ content: `successfully changed ${user.tag}'s nickname!` });
				} catch (error: any) {
					interaction.createError({ content: `i can't change ${user.tag}'s nickname sorry! :(` });
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'remove': {
				const user: Lib.Member = interaction.options.getMember('user', true);

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (!interaction.member.permissions.has('MANAGE_NICKNAMES')) {
						return interaction.createError({ content: 'you need manage nicknames permission to do that...' });
					}

					if (user.id === interaction.guild.ownerID) {
						return interaction.createError({ content: `i can't change/remove the owner nickname` });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createError({
							content: `i can't change/remove user nickname that has administrator permission`,
						});
					}

					if (
						interaction.getHighestRole(user).position >=
						interaction.getHighestRole(interaction.member).position
					) {
						return interaction.createError({ content: 'that user has higher/same role than you' });
					}
				}

				if (
					interaction.getHighestRole(user).position >=
					interaction.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createError({ content: 'that user has higher/same role than me' });
				}

				try {
					user.edit({ nick: '' });
					interaction.createSuccess({ content: `successfully changed ${user.tag}'s nickname!` });
				} catch (error: any) {
					interaction.createError({ content: `i can't change ${user.tag}'s nickname sorry! :(` });
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
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
