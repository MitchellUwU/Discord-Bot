import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord-api-types/v10';
import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import CommandInterface from '../../interfaces/command';
import * as Lib from 'oceanic.js';
import InteractionWrapper from '../../utils/interactionWrapper';

export default class EightBallCommand extends CommandInterface {
	public override data = new Builders.Command(ApplicationCommandType.ChatInput, '8ball')
		.setDescription('an 8ball, what do you expect?')
		.addOption(
			new Builders.Option(ApplicationCommandOptionType.String, 'message')
				.setDescription('what do you want to tell 8ball?')
				.setRequired(true)
				.toJSON()
		)
		.toJSON();

	public async execute(
		client: BotClient,
		interaction: InteractionWrapper
	): Promise<void | Lib.Message<Lib.TextChannel>> {
		const message: string = interaction.options.getString('message', true);
		const config = client.config.answers;
		const botAnswer: string = config.repliesTemplate[
			Math.floor(Math.random() * config.repliesTemplate.length)
		]
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
