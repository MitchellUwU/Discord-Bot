import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord-api-types/v10';
import BotClient from '../../../client';
import { Builders } from '../../../utils/builders';
import CommandInterface from '../../../interfaces/command';
import * as Lib from 'oceanic.js';
import InteractionWrapper from '../../../utils/interactionWrapper';

export default class EchoCommand extends CommandInterface {
	public override data = new Builders.Command(ApplicationCommandType.ChatInput, 'echo')
		.setDescription('echo your message')
		.addOption(
			new Builders.Option(ApplicationCommandOptionType.String, 'message')
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
