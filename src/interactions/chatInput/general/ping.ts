import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import { performance } from 'perf_hooks';

export default class PingCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'ping')
		.setDescription('Show bot latency.')
		.setDMPermission(false)
		.toJSON();

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		const startTime = performance.now();
		await interaction.defer();
		const endTime = performance.now();

		interaction.editOriginal({
			embeds: [
				new Builders.Embed()
					.setRandomColor()
					.setTitle('🏓 Pong!')
					.setDescription(
						`**Bot latency:** ${(endTime - startTime).toFixed(0)}ms`,
						`**Rest latency:** ${this.client.rest.handler.latencyRef.latency}ms`,
						`**Gateway latency:** ${interaction.guild.shard.latency}ms`.replace('Infinityms', 'Unavailable')
					)
					.setTimestamp()
					.toJSON(),
			],
		});
	}
}
