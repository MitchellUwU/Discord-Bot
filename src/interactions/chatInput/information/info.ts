import BotClient from '../../../client';
import Builders from '../../../utils/builders';
import Command from '../../../interfaces/command';
import * as Lib from 'oceanic.js';
import ms from 'ms';
import packageJSON from '../../../../package.json';
import InteractionWrapper from '../../../utils/interactionWrapper';

export default class InfoCommand extends Command {
	public override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'info')
		.setDescription('show a super duper cool information')
		.toJSON();

	public async execute(
		client: BotClient,
		interaction: InteractionWrapper
	): Promise<void | Lib.Message<Lib.TextChannel>> {
		interaction.createMessage({
			embeds: [
				new Builders.Embed()
					.setRandomColor()
					.setTitle('ℹ information')
					.addFields([
						{
							name: '📄 general info',
							value: [
								`**developer:** ${packageJSON.author}`,
								`**bot version:** ${packageJSON.version}`,
								`**total commands:** ${client.interactions.size}`,
								`**total guilds:** ${client.guilds.size}`,
								`**total shards:** ${client.shards.size} (this guild is in shard ${
									interaction.guild.shard.id + 1
								})`,
								`**uptime:** ${ms(process.uptime() * 1000, { long: true })}`,
							].join('\n'),
						},
						{
							name: '💻 more info for nerds',
							value: [
								`**gateway version:** v${Lib.Constants.GATEWAY_VERSION}`,
								`**rest version:** v${Lib.Constants.REST_VERSION}`,
								`**library used:** oceanic v${Lib.VERSION}`,
								`**written in:** typescript version ${packageJSON.devDependencies.typescript}`,
								`**node.js version:** ${process.version}`,
							].join('\n'),
						},
					])
					.setTimestamp()
					.toJSON(),
			],
		});
	}
}
