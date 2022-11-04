import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import InteractionWrapper from '../../../classes/InteractionWrapper';
import { ExecuteReturnType } from '../../../types/additional';

export default class EightBallCommand extends Command {
	override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, '8ball')
		.setDescription('an 8ball, what do you expect?')
		.setDMPermission(false)
		.addOption(
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'message')
				.setDescription('what do you want to tell 8ball?')
				.setRequired(true)
				.toJSON()
		)
		.toJSON();

	async execute(client: BotClient, interaction: InteractionWrapper): ExecuteReturnType {
		const message = interaction.options.getString('message', true);
		const config = client.config.answers;
		const botAnswer = config.repliesTemplate[Math.floor(Math.random() * config.repliesTemplate.length)]
			.replace('{answer}', config.answers[Math.floor(Math.random() * config.answers.length)])
			.replace('{pronouns}', config.pronouns[Math.floor(Math.random() * config.pronouns.length)])
			.replace('{faces}', config.faces[Math.floor(Math.random() * config.faces.length)]);

		interaction.createMessage({
			embeds: [
				new Builders.Embed()
					.setRandomColor()
					.setTitle('🎱 8ball')
					.setDescription(
						`**question:** ${message}\n**answer:** ${botAnswer.replaceAll(
							'{authorName}',
							interaction.user.username
						)}`
					)
					.setTimestamp()
					.toJSON(),
			],
		});
	}
}
