import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import { errors } from '../../../locales/main';

export default class EightBallCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'games')
		.setDescription('Simple games. Fun fact: This will never appear in the discord client.')
		.setDMPermission(false)
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'rps')
				.setDescription('Rock Paper Scissors, A true classic.')
				.addOption(
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'choice')
						.setDescription('Choose one.')
						.addChoices([
							new Builders.Choice('Rock', 'Rock').toJSON(),
							new Builders.Choice('Paper', 'Paper').toJSON(),
							new Builders.Choice('Scissors', 'Scissors').toJSON(),
						])
						.setRequired(true)
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		const command = interaction.data.options.getSubCommand(true).toString();

		switch (command) {
			case 'rps': {
				const choices = ['Rock', 'Paper', 'Scissors'];
				const playerChoice = interaction.data.options.getString('choice', true);
				const botChoice = choices[Math.floor(Math.random() * choices.length)];
				let result: string;

				if (!choices.includes(playerChoice)) {
					return interaction.createMessage({ content: errors.invalidChoice });
				}

				if (playerChoice === botChoice) result = 'You tied!';
				else if (playerChoice === 'Rock' && botChoice === 'Paper') result = 'I win!';
				else if (playerChoice === 'Paper' && botChoice === 'Scissors') result = 'I win!';
				else if (playerChoice === 'Scissors' && botChoice === 'Rock') result = 'I win!';
				else result = 'You win!';

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setTitle('🗻 Rock 📃 Paper ✂ Scissors')
							.setDescription(
								`**Your choice:** ${playerChoice}`,
								`**Bot choice:** ${botChoice}`,
								`**Result:** ${result}`
							)
							.setTimestamp()
							.toJSON(),
					],
				});
				break;
			}
			default: {
				interaction.createMessage({ content: errors.invalidSubcommand, flags: 64 });
			}
		}
	}
}
