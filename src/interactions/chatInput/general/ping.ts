import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import InteractionWrapper from '../../../classes/InteractionWrapper';
import { performance } from 'perf_hooks';
import { ExecuteReturnType } from '../../../types/additional';

export default class PingCommand extends Command {
	override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'ping')
		.setDescription('show latency statistic thing')
		.setDMPermission(false)
		.toJSON();

	async execute(client: BotClient, interaction: InteractionWrapper): ExecuteReturnType {
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
