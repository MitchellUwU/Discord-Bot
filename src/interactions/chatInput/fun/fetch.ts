import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import { Constants } from 'oceanic.js';
import { request } from 'undici';
import InteractionWrapper from '../../../classes/InteractionWrapper';

export default class FetchCommand extends Command {
	override data = new Builders.Command(Constants.ApplicationCommandTypes.CHAT_INPUT, 'fetch')
		.setDescription('fetch some random stuff from the internet')
		.setDMPermission(false)
		.addOptions([
			new Builders.Option(Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'meme')
				.setDescription('memes')
				.toJSON(),
			new Builders.Option(Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'cat')
				.setDescription('a cat picture')
				.toJSON(),
			new Builders.Option(Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'urban')
				.setDescription('search urban dictionary')
				.addOption(
					new Builders.Option(Constants.ApplicationCommandOptionTypes.STRING, 'word')
						.setDescription('a word or sentence or whatever')
						.setRequired(true)
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	async execute(client: BotClient, interaction: InteractionWrapper) {
		const command = interaction.options.getSubCommand(true);

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
				const message = interaction.options.getString('word', true);
				const query = new URLSearchParams(message);
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
				interaction.createError({
					content: 'wait for a bit or until the bot restart and try again',
				});
			}
		}
	}
}
