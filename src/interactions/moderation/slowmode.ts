import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord-api-types/v10';
import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import CommandInterface from '../../interfaces/command';
import Lib from 'oceanic.js';
import InteractionWrapper from '../../utils/interactionWrapper';
import ms from 'ms';

export default class SlowmodeCommand extends CommandInterface {
	public override data = new Builders.Command(ApplicationCommandType.ChatInput, 'slowmode')
		.setDescription('manage slowmode')
		.addOptions([
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'change')
				.setDescription('change channel slowmode')
				.addOption(
					new Builders.Option(ApplicationCommandOptionType.String, 'time')
						.setDescription('slowmode time (must be between 1 second and 6 hours)')
						.setRequired(true)
						.toJSON()
				)
				.toJSON(),
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'remove')
				.setDescription('remove channel slowmode')
				.toJSON(),
		])
		.toJSON();

	public async execute(client: BotClient, interaction: InteractionWrapper): Promise<void> {
		let command = interaction.options.getSubCommand<Lib.SubCommandArray>(false);
		if (!command) command = ['unknown'];

		switch (command.toString()) {
			case 'change': {
				const time: string = interaction.options.getString('time', true);
				const realtime: number = ms(`${time}`);

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
						return interaction.createError({ content: 'you need manage channels permission to do that...' });
					}
				}

				if (isNaN(realtime)) {
					return interaction.createError({ content: 'invalid time!' });
				}

				if (realtime > 21600000 || realtime < 1000) {
					return interaction.createError({ content: 'time must be between 1 second and 6 hours' });
				}

				try {
					interaction.channel.edit({ rateLimitPerUser: realtime / 1000 });
					interaction.createSuccess({ content: 'successfully changed the slowmode!' });
				} catch (error: any) {
					interaction.createError({ content: "i can't change the slowmode sorry! :(" });
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'remove': {
				if (interaction.user.id !== interaction.guild.ownerID) {
					if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
						return interaction.createError({ content: 'you need manage channels permission to do that...' });
					}
				}
				
				try {
					interaction.channel.edit({ rateLimitPerUser: 0 });
					interaction.createSuccess({ content: 'successfully removed the slowmode!' });
				} catch (error: any) {
					interaction.createError({ content: "i can't remove the slowmode sorry! :(" });
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
