import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import { answers } from '../../../../config.json';
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

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		const message = interaction.data.options.getString('message', true);

		interaction.createMessage({
			embeds: [
				new Builders.Embed()
					.setRandomColor()
					.setTitle('🎱 8ball')
					.setDescription(
						`**question:** ${message}`,
						`**answer:** ${answers[Math.floor(Math.random() * answers.length)]}`
					)
					.setTimestamp()
					.toJSON(),
			],
			components: new Builders.ActionRow().addInteractionButton({
				label: 'regenerate',
				style: Lib.ButtonStyles.PRIMARY,
				customID: [interaction.user.id, interaction.id, 'regen8ball', this.client.utils.trim(message, 25)].join('|'),
			}).toJSON(),
		});
	}
}
