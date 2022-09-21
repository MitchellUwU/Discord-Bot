import { ApplicationCommandType } from 'discord-api-types/v10';
import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import CommandInterface from '../../interfaces/command';
import InteractionWrapper from '../../utils/interactionWrapper';

export default class PingCommand extends CommandInterface {
	public override data = new Builders.Command(ApplicationCommandType.ChatInput, 'ping')
		.setDescription('show latency statistic thing')
		.toJSON();

	public async execute(client: BotClient, interaction: InteractionWrapper): Promise<void> {
		interaction.createMessage({
			embeds: [
				new Builders.Embed()
					.setRandomColor()
					.setTitle('🏓 pong!')
					.setDescription(
						[
							`**bot latency:** ${Math.floor(Date.now() - interaction.raw.createdAt.getTime())}ms`,
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
