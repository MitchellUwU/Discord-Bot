import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import { Constants } from 'oceanic.js';
import InteractionWrapper from '../../../classes/InteractionWrapper';

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

	async execute(client: BotClient, interaction: InteractionWrapper) {
		interaction.createMessage({
			embeds: [
				new Builders.Embed()
					.setRandomColor()
					.setAuthor(`${interaction.user.tag} said:`, interaction.user.avatarURL())
					.setDescription(`${interaction.options.getString('message', true)}`)
					.setTimestamp()
					.toJSON(),
			],
		});
	}
}
