import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';

export default class EchoCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'echo')
		.setDescription('Echo your message.')
		.setDMPermission(false)
		.addOption(
			new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'message')
				.setDescription('Message to echo.')
				.setMinMax(1, 2000)
				.setRequired(true)
				.toJSON()
		)
		.toJSON();

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		interaction.createMessage({ content: interaction.data.options.getString('message', true) });
	}
}
