import { ApplicationCommandType } from 'discord-api-types/v10';
import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import CommandInterface from '../../interfaces/command';
import InteractionWrapper from '../../utils/interactionWrapper';

export default class AboutCommand extends CommandInterface {
	public override data = new Builders.Command(ApplicationCommandType.ChatInput, 'about')
		.setDescription('about me!')
		.toJSON();

	public async execute(client: BotClient, interaction: InteractionWrapper): Promise<void> {
		interaction.createMessage({
			embeds: [
				new Builders.Embed()
					.setRandomColor()
					.setTitle('ℹ about this bot')
					.addFields([
						{
							name: 'note',
							value: [
								'first of all, this is still in beta so it could change later on.',
								'second of all, development of this bot is VERY VERY slow due to some issues like library changes, typescript migrate and so on.',
								'most changes to this bot are mostly internal, so beta 2 may seem like beta 1 but its not.',
								'the bot also has went from beta to alpha for like 10 times. so yea... this bot will probably will never release but i am planning to open source the code on github. (if i managed to finish it)',
							].join('\n'),
						},
						{
							name: 'general',
							value: [
								'it just a average bot, it does things normally. there is literally nothing special about it.'
							].join('\n'),
						},
						{
							name: 'history',
							value: [
								'believe it or not, this bot actually begin development on march 7th 2021 .(1 year of development!)',
								'but... i abandoned it until october 10th 2021 so technically almost 1 year of development.',
								'first version of this bot was very simple and boring, it have only 3 commands (the commands also only send 1 simple message). it was made with discord.js v12.',
								'first revision (october 10th 2021) of the bot (also made with discord.js v12), believe it or not, was made in less than 5 hours with over 10 commands but they were copied from tutorial i found online. a month after the first revision, i added database related commands (with mongodb btw) which was also very boring.',
								'first rewrite (end of 2021) of the bot was migration to discord.js v13, it was the terrible experience. after 2 month (around february 2022) i found new library called "Eris". at first i dont see a need for it, but later on, as my knowledge of js and discord api increase. i migrated my bot to Eris codebase. which leads to second rewrite.',
							].join('\n'),
						},
						{
							name: 'history (follow up)',
							value: [
								'second rewrite (february 2022) (made with eris) of the bot is very... interesting, this rewrite isnt really a rewrite more like a test project for me to mess around with. this "rewrite" lasted for over 4 months!',
								'second revision (may 2022) (also made with eris) originally written in javascript but was migrated to typescript a month later, some of the codebase design in this revision is still in current version of the bot, cool!',
								'third revision and rewrite (july 2022) (was made with eris but migrated to oceanic.js at late august 2022) is the current version and latest version (and also probably last version) of the bot. almost all of the codebase is entirely rewriten and rebulit, will probably be finished on late 2022',
							].join('\n'),
						},
					])
					.setTimestamp()
					.toJSON(),
			],
		});
	}
}
