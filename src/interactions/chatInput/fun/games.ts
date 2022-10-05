import BotClient from '../../../client';
import Builders from '../../../utils/builders';
import Command from '../../../interfaces/command';
import * as Lib from 'oceanic.js';
import InteractionWrapper from '../../../utils/interactionWrapper';

export default class EightBallCommand extends Command {
	public override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'games')
		.setDescription('games')
		.addOptions([
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'rps')
				.setDescription('rock paper scissors')
				.addOption(
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'choice')
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

	public async execute(
		client: BotClient,
		interaction: InteractionWrapper
	): Promise<void | Lib.Message<Lib.TextChannel>> {
		let command = interaction.options.getSubCommand<Lib.SubCommandArray>(false);
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
