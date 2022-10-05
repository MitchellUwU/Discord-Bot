import BotClient from '../../../client';
import Builders from '../../../utils/builders';
import Command from '../../../interfaces/command';
import * as Lib from 'oceanic.js';
import InteractionWrapper from '../../../utils/interactionWrapper';
import { performance } from 'perf_hooks';

export default class PingCommand extends Command {
	public override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'ping')
		.setDescription('show latency statistic thing')
		.toJSON();

	public async execute(
		client: BotClient,
		interaction: InteractionWrapper
	): Promise<void | Lib.Message<Lib.AnyGuildTextChannel>> {
		const startTime = performance.now();
		await interaction.deferResponse();
		const endTime = performance.now();

		interaction.editOriginal({
			embeds: [
				new Builders.Embed()
					.setRandomColor()
					.setTitle('🏓 pong!')
					.setDescription(
						[
							`**bot latency:** ${(endTime - startTime).toFixed(0)}ms`,
							`**rest latency:** ${client.rest.handler.latencyRef.latency}ms`,
							`**gateway latency:** ${interaction.guild.shard.latency}ms`.replace(
								'Infinityms',
								'wait for a minute and it should show up'
							),
						].join('\n')
					)
					.setTimestamp()
					.toJSON(),
			],
		});
	}
}
