import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import ms from 'ms';
import { errors, success } from '../../../locales/main';

export default class SlowmodeCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'slowmode')
		.setDescription('Manage slowmode. Fun fact: This will never appear in the discord client.')
		.setDMPermission(false)
		.setDefaultMemberPermissions('MANAGE_CHANNELS')
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'change')
				.setDescription('Change channel slowmode.')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'time')
						.setDescription('Duration of slowmode. (Must be between 1 second and 6 hours)')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.CHANNEL, 'channel')
						.setDescription('Channel to change slowmode.')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'remove')
				.setDescription('Remove channel slowmode.')
				.addOption(
					new Builders.Option(Lib.ApplicationCommandOptionTypes.CHANNEL, 'channel')
						.setDescription('Channel to remove slowmode.')
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	override userPermission = 'MANAGE_CHANNELS' as Lib.PermissionName;

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		const command = interaction.data.options.getSubCommand(true).toString();

		switch (command) {
			case 'change': {
				const channel =
					interaction.data.options.getChannel('channel', false)?.completeChannel || interaction.channel;

				const time = interaction.data.options.getString('time', true);
				const realtime = ms(`${time}`);

				if (!(channel instanceof Lib.TextableChannel)) {
					return interaction.createMessage({ content: errors.notTextableChannel });
				}

				if (isNaN(realtime)) {
					return interaction.createMessage({ content: errors.invalidTime });
				}

				if (realtime > 21600000 || realtime < 1000) {
					return interaction.createMessage({ content: errors.timeExceedOrBelowLimitSlowmode });
				}

				try {
					channel.edit({ rateLimitPerUser: realtime / 1000 });
					interaction.createMessage({ content: success.changeSlowmode(channel, realtime) });
				} catch (error) {
					interaction.createMessage({ content: errors.cannotChangeSlowmode(error) });

					if (error instanceof Error) {
						this.client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
					} else {
						this.client.utils.logger({ title: 'Error', content: error, type: 2 });
					}
				}

				break;
			}
			case 'remove': {
				const channel =
					interaction.data.options.getChannel('channel', false)?.completeChannel || interaction.channel;

				if (!(channel instanceof Lib.TextableChannel)) {
					return interaction.createMessage({ content: errors.notTextableChannel });
				}

				try {
					channel.edit({ rateLimitPerUser: 0 });
					interaction.createMessage({ content: success.removeSlowmode(channel) });
				} catch (error) {
					interaction.createMessage({ content: errors.cannotRemoveSlowmode(error) });

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
