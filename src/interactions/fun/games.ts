import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord-api-types/v10';
import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import CommandInterface from '../../interfaces/command';
import Lib from 'oceanic.js';
import InteractionWrapper from '../../utils/interactionWrapper';

export default class EightBallCommand extends CommandInterface {
	override data = new Builders.Command(ApplicationCommandType.ChatInput, 'games')
		.setDescription('games')
		.addOptions([
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'rps')
				.setDescription('rock paper scissors')
				.addOption(
					new Builders.Option(ApplicationCommandOptionType.String, 'choice')
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

	async execute(
		client: BotClient,
		interaction: InteractionWrapper
	): Promise<void | Lib.Message<Lib.TextChannel>> {
		let command = interaction.options.getSubCommand<Lib.SubCommandArray>(false);
		if (!command) command = ['unknown'];

		switch (command.toString()) {
			case 'rps': {
				const choices: Array<string> = ['rock', 'paper', 'scissors'];
				const playerChoice: string = interaction.options.getString('choice', true);
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
				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setTitle('wait...')
							.setDescription(
								'how did you get here? use the command properly! you are not supposed to be here, go away!'
							)
							.setTimestamp()
							.toJSON(),
					],
					flags: 64,
				});
			}
		}
	}
}
