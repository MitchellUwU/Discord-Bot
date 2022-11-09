import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import { Constants, SubCommandArray } from 'oceanic.js';
import InteractionWrapper from '../../../classes/InteractionWrapper';
import { ExecuteReturnType } from '../../../types/additional';

export default class EightBallCommand extends Command {
	override data = new Builders.Command(Constants.ApplicationCommandTypes.CHAT_INPUT, 'games')
		.setDescription('games')
		.setDMPermission(false)
		.addOptions([
			new Builders.Option(Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'rps')
				.setDescription('rock paper scissors')
				.addOption(
					new Builders.Option(Constants.ApplicationCommandOptionTypes.STRING, 'choice')
						.setDescription('choose one')
						.addChoices([
							new Builders.Choice('rock', 'rock').toJSON(),
							new Builders.Choice('paper', 'paper').toJSON(),
							new Builders.Choice('scissors', 'scissors').toJSON(),
						])
						.setRequired(true)
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	async execute(client: BotClient, interaction: InteractionWrapper): ExecuteReturnType {
		let command = interaction.options.getSubCommand<SubCommandArray>(false);
		if (!command) command = ['unknown'];

		switch (command.toString()) {
			case 'rps': {
				const choices = ['rock', 'paper', 'scissors'];
				const playerChoice = interaction.options.getString('choice', true);
				const botChoice = choices[Math.floor(Math.random() * choices.length)];
				let result: string;

				if (!choices.includes(playerChoice)) {
					return interaction.createError({ content: 'can you do it properly? please?' });
				}

				if (playerChoice === botChoice) result = 'you tied!';
				else if (playerChoice === 'rock' && botChoice === 'paper') result = 'i win!';
				else if (playerChoice === 'paper' && botChoice === 'scissors') result = 'i win!';
				else if (playerChoice === 'scissors' && botChoice === 'rock') result = 'i win!';
				else result = 'you win!';

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setTitle('🗻 rock 📃 paper ✂ scissors')
							.setDescription(
								`**your choice:** ${playerChoice}\n**bot choice:** ${botChoice}\n**result:** ${result}`
							)
							.setTimestamp()
							.toJSON(),
					],
				});
				break;
			}
			default: {
				interaction.createError({
					content: 'wait for a bit or until the bot restart and try again',
				});
			}
		}
	}
}
