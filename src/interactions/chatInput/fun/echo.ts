import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import { AnyGuildTextChannel, CommandInteraction, Constants } from 'oceanic.js';

export default class EchoCommand extends Command {
	override data = new Builders.Command(Constants.ApplicationCommandTypes.CHAT_INPUT, 'echo')
		.setDescription('echo your message')
		.setDMPermission(false)
		.addOption(
			new Builders.Option(Constants.ApplicationCommandOptionTypes.STRING, 'message')
				.setDescription('a message')
				.setRequired(true)
				.toJSON()
		)
		.toJSON();

	async execute(client: BotClient, interaction: CommandInteraction<AnyGuildTextChannel>) {
		interaction.createMessage({
			embeds: [
				new Builders.Embed()
					.setRandomColor()
					.setAuthor(`${interaction.user.tag} said:`, interaction.user.avatarURL())
					.setDescription(`${interaction.data.options.getString('message', true)}`)
					.setTimestamp()
					.toJSON(),
			],
		});
	}
}
