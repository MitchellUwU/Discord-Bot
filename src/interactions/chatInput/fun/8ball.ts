import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';

export default class EightBallCommand extends Command {
	private answers: string[] = [
		'it is certain',
		'without a doubt',
		'you may rely on it',
		'yes definitely',
		'it is decidedly so',
		'as I see it, yes',
		'most likely',
		'yes',
		'outlook good',
		'signs point to yes',
		'reply hazy try again',
		'better not tell you now',
		'ask again later',
		'cannot predict now',
		'concentrate and ask again',
		"don't count on it",
		'outlook not so good',
		'my sources say no',
		'very doubtful',
		'my reply is no',
	];

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

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		const message = interaction.data.options.getString('message', true);

		interaction.createMessage({
			embeds: [
				new Builders.Embed()
					.setRandomColor()
					.setTitle('🎱 8ball')
					.setDescription(
						`**question:** ${message}`,
						`**answer:** ${this.answers[Math.floor(Math.random() * this.answers.length)]}`
					)
					.setTimestamp()
					.toJSON(),
			],
		});
	}
}
