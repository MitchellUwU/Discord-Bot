import BotClient from '../../../client';
import Builders from '../../../utils/builders';
import Command from '../../../interfaces/command';
import * as Lib from 'oceanic.js';
import InteractionWrapper from '../../../utils/interactionWrapper';

export default class EchoCommand extends Command {
	public override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'echo')
		.setDescription('echo your message')
		.addOption(
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'message')
				.setDescription('a message')
				.setRequired(true)
				.toJSON()
		)
		.toJSON();

	public async execute(
		client: BotClient,
		interaction: InteractionWrapper
	): Promise<void | Lib.Message<Lib.TextChannel>> {
		interaction.createMessage({
			embeds: [
				new Builders.Embed()
					.setRandomColor()
					.setAuthor({
						name: `${interaction.user.tag} said:`,
						iconURL: interaction.user.avatarURL(),
					})
					.setDescription(`${interaction.options.getString('message', true)}`)
					.setTimestamp()
					.toJSON(),
			],
		});
	}
}
