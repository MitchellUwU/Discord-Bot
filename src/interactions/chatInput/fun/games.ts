import type BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';

export default class EightBallCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'games')
		.setDescription('games')
		.setDMPermission(false)
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'rps')
				.setDescription('rock paper scissors')
				.addOption(
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'choice')
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

	override async execute(_client: BotClient, interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		const command = interaction.data.options.getSubCommand(true);

		switch (command.toString()) {
			case 'rps': {
				const choices = ['rock', 'paper', 'scissors'];
				const playerChoice = interaction.data.options.getString('choice', true);
				const botChoice = choices[Math.floor(Math.random() * choices.length)];
				let result: string;

				if (!choices.includes(playerChoice)) {
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription('can you do it properly? please?').toJSON()],
					});
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
								`**your choice:** ${playerChoice}`,
								`**bot choice:** ${botChoice}`,
								`**result:** ${result}`
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
						Builders.ErrorEmbed()
							.setDescription('wait for a bit or until the bot restart and try again')
							.toJSON(),
					],
				});
			}
		}
	}
}
