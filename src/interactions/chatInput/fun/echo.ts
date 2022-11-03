import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import InteractionWrapper from '../../../classes/InteractionWrapper';
import { ExecuteReturnType } from '../../../types/additional';

export default class EchoCommand extends Command {
	public override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'echo')
		.setDescription('echo your message')
		.setDMPermission(false)
		.addOption(
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'message')
				.setDescription('a message')
				.setRequired(true)
				.toJSON()
		)
		.toJSON();

	public async execute(client: BotClient, interaction: InteractionWrapper): ExecuteReturnType {
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
