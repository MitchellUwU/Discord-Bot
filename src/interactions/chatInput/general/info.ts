import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import { AnyGuildTextChannel, CommandInteraction, Constants, VERSION } from 'oceanic.js';
import packageJSON from '../../../../package.json';
import ms from 'ms';

export default class InfoCommand extends Command {
	override data = new Builders.Command(Constants.ApplicationCommandTypes.CHAT_INPUT, 'info')
		.setDescription('show a super duper cool information')
		.setDMPermission(false)
		.toJSON();

	async execute(client: BotClient, interaction: CommandInteraction<AnyGuildTextChannel>) {
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
								`**total commands:** ${client.handler.chatInputCommands.size}`,
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
								`**gateway version:** v${Constants.GATEWAY_VERSION}`,
								`**rest version:** v${Constants.REST_VERSION}`,
								`**library used:** oceanic v${VERSION}`,
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
