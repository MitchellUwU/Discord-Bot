import BotClient from '../../../client';
import Builders from '../../../utils/builders';
import Command from '../../../interfaces/command';
import * as Lib from 'oceanic.js';
import InteractionWrapper from '../../../utils/interactionWrapper';
import ms from 'ms';

export default class SlowmodeCommand extends Command {
	public override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'slowmode')
		.setDescription('manage slowmode')
		.addOptions([
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'change')
				.setDescription('change channel slowmode')
				.addOptions([
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'time')
						.setDescription('slowmode time (must be between 1 second and 6 hours)')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.CHANNEL, 'channel')
						.setDescription('channel to change slowmode')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'remove')
				.setDescription('remove channel slowmode')
				.addOption(
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.CHANNEL, 'channel')
						.setDescription('channel to remove slowmode')
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	public async execute(
		client: BotClient,
		interaction: InteractionWrapper
	): Promise<void | Lib.Message<Lib.TextChannel>> {
		if (interaction.user.id !== interaction.guild.ownerID) {
			if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
				return interaction.createError({
					content:
						"you need manage channels permission to do that! if you're a moderator, please ask an admin or the owner to give you the permission",
				});
			}
		}

		let command = interaction.options.getSubCommand(false);
		if (!command) command = ['unknown'];

		switch (command.toString()) {
			case 'change': {
				const channel =
					interaction.options.getChannel('channel', false)?.completeChannel || interaction.channel;

				const time = interaction.options.getString('time', true);
				const realtime = ms(`${time}`);

				if (!(channel instanceof Lib.TextableChannel)) {
					return interaction.createError({
						content: `${channel.mention} is not a textable channel! please specify a textable channel`,
					});
				}

				if (isNaN(realtime)) {
					return interaction.createError({
						content: 'invalid time! please specify them correctly (example: 5h, 10 minutes etc.)',
					});
				}

				if (realtime > 21600000 || realtime < 1000) {
					return interaction.createError({ content: 'time must be between 1 second and 6 hours' });
				}

				try {
					channel.edit({ rateLimitPerUser: realtime / 1000 });
					interaction.createSuccess({
						content: `successfully changed ${channel.name} slowmode to ${ms(realtime, { long: true })}!`,
					});
				} catch (error: any) {
					interaction.createError({
						content: `i can't change ${channel.name} slowmode sorry! :(\n\n${error.name}: ${error.message}`,
					});
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'remove': {
				const channel =
					interaction.options.getChannel('channel', false)?.completeChannel || interaction.channel;

				if (!(channel instanceof Lib.TextableChannel)) {
					return interaction.createError({
						content: `${channel.mention} is not a textable channel! please specify a textable channel`,
					});
				}

				try {
					channel.edit({ rateLimitPerUser: 0 });
					interaction.createSuccess({ content: `successfully removed ${channel.name} slowmode!` });
				} catch (error: any) {
					interaction.createError({
						content: `i can't remove ${channel.name} slowmode sorry! :(\n\n${error.name}: ${error.message}`,
					});
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
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
