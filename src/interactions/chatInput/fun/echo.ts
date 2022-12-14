import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';

export default class EchoCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'echo')
		.setDescription('echo your message (will also display your name)')
		.setDMPermission(false)
		.addOption(
			new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'message')
				.setDescription('message to echo')
				.setRequired(true)
				.toJSON()
		)
		.toJSON();

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
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
