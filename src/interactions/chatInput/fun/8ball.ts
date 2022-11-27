import type BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';

export default class EightBallCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, '8ball')
		.setDescription('ask the 8ball (kinda) a question')
		.setDMPermission(false)
		.addOption(
			new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'message')
				.setDescription('what do you want to tell 8ball?')
				.setRequired(true)
				.toJSON()
		)
		.toJSON();

	override async execute(client: BotClient, interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		const message = interaction.data.options.getString('message', true);
		const config = client.config.answers;
		const botAnswer = config.repliesTemplate[
			Math.floor(Math.random() * config.repliesTemplate.length)
		]!.replace('{answer}', config.answers[Math.floor(Math.random() * config.answers.length)]!)
			.replace('{pronouns}', config.pronouns[Math.floor(Math.random() * config.pronouns.length)]!)
			.replace('{faces}', config.faces[Math.floor(Math.random() * config.faces.length)]!)
			.replaceAll('{authorName}', interaction.user.username);

		interaction.createMessage({
			embeds: [
				new Builders.Embed()
					.setRandomColor()
					.setTitle('🎱 8ball')
					.setDescription(`**question:** ${message}`, `**answer:** ${botAnswer}`)
					.setTimestamp()
					.toJSON(),
			],
		});
	}
}
