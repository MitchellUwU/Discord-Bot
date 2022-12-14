import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import packageJSON from '../../../../package.json';
import ms from 'ms';

export default class InfoCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'info')
		.setDescription('show a super duper cool information')
		.setDMPermission(false)
		.toJSON();

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
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
								`**total commands:** ${this.client.handler.chatInputCommands.size}`,
								`**total guilds:** ${this.client.guilds.size}`,
								`**total shards:** ${this.client.shards.size} (this guild is in shard ${
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
