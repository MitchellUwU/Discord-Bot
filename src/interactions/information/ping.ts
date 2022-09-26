import { ApplicationCommandType } from 'discord-api-types/v10';
import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import CommandInterface from '../../interfaces/command';
import Lib from 'oceanic.js';
import InteractionWrapper from '../../utils/interactionWrapper';
import { performance } from 'perf_hooks';

export default class PingCommand extends CommandInterface {
	public override data = new Builders.Command(ApplicationCommandType.ChatInput, 'ping')
		.setDescription('show latency statistic thing')
		.toJSON();

	public async execute(client: BotClient, interaction: InteractionWrapper): Promise<void | Lib.Message<Lib.TextChannel>> {
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
