import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import packageJSON from '../../../../package.json';
import ms from 'ms';

export default class InfoCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'info')
		.setDescription('Show some information about the bot.')
		.setDMPermission(false)
		.toJSON();

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		interaction.createMessage({
			embeds: [
				new Builders.Embed()
					.setRandomColor()
					.setTitle('ℹ Information')
					.addFields([
						{
							name: '📄 General',
							value: [
								`**Developer:** ${packageJSON.author}`,
								`**Bot version:** ${packageJSON.version}`,
								`**Total commands:** ${this.client.handler.chatInputCommands.size}`,
								`**Total guilds:** ${this.client.guilds.size}`,
								`**Total shards:** ${this.client.shards.size} (You're in ${interaction.guild.shard.id + 1})`,
								`**Uptime:** ${ms(process.uptime() * 1000, { long: true })}`,
							].join('\n'),
						},
						{
							name: '💻 Info for nerds',
							value: [
								`**Gateway version:** v${Lib.Constants.GATEWAY_VERSION}`,
								`**REST version:** v${Lib.Constants.REST_VERSION}`,
								`**Library used:** Oceanic v${Lib.VERSION}`,
								`**Written in:** Typescript version ${packageJSON.devDependencies.typescript}`,
								`**Node.JS version:** ${process.version}`,
							].join('\n'),
						},
					])
					.setTimestamp()
					.toJSON(),
			],
		});
	}
}
