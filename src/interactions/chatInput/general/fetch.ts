import BotClient from '../../../client';
import Builders from '../../../utils/builders';
import Command from '../../../interfaces/command';
import * as Lib from 'oceanic.js';
import { request } from 'undici';
import InteractionWrapper from '../../../utils/interactionWrapper';

export default class FetchCommand extends Command {
	public override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'fetch')
		.setDescription('fetch some random stuff from the internet')
		.addOptions([
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'meme')
				.setDescription('memes')
				.toJSON(),
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'cat')
				.setDescription('a cat picture')
				.toJSON(),
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'urban')
				.setDescription('search urban dictionary')
				.addOption(
					new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'word')
						.setDescription('a word or sentence or whatever')
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
			case 'meme': {
				interaction.deferResponse();

				const data = await request('https://meme-api.herokuapp.com/gimme/memes');
				const file = await client.utils.getJSONContent(data.body);

				interaction.editOriginal({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setTitle(file.title)
							.setDescription(
								`**- upvotes:** ${file.ups}\n**- post link:** [Link](${file.postLink})\n**- subreddit:** r/${
									file.subreddit
								}\n**- post author:** ${file.author}\n**- nsfw:** ${
									file.nsfw ? 'yes' : 'no'
								}\n**- spoiler:** ${file.spoiler ? 'yes' : 'no'}`
							)
							.setImage(file.url)
							.setTimestamp()
							.toJSON(),
					],
				});

				break;
			}
			case 'cat': {
				interaction.deferResponse();

				const data = await request('https://aws.random.cat/meow');
				const { file } = await client.utils.getJSONContent(data.body);

				interaction.editOriginal({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setTitle('a cat picture :D')
							.setImage(file)
							.setTimestamp()
							.toJSON(),
					],
				});

				break;
			}
			case 'urban': {
				const message: string = interaction.options.getString('word', true);
				const query: URLSearchParams = new URLSearchParams(message);
				const data = await request(`https://api.urbandictionary.com/v0/define?term=${query}`);
				const { list } = await client.utils.getJSONContent(data.body);

				if (!list.length) return interaction.createError({ content: 'no result found :(' });

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setTitle(`${list[0].word} defined by ${list[0].author}`)
							.setURL(list[0].permalink)
							.setDescription(`👍 ${list[0].thumbs_up} upvotes | 👎 ${list[0].thumbs_down} downvotes`)
							.addFields([
								{
									name: 'definition:',
									value: list[0].definition,
								},
								{
									name: 'example:',
									value: list[0].example,
								},
							])
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
