import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import { request } from 'undici';
import { errors } from '../../../locales/main';

export default class FetchCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'fetch')
		.setDescription(
			'Fetch something from the internet. Fun fact: This will never appear in the discord client.'
		)
		.setDMPermission(false)
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'cat')
				.setDescription('Fetch a cat picture.')
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'urban')
				.setDescription('Search Urban Dictionary.')
				.addOption(
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'word')
						.setDescription('Anything')
						.setRequired(true)
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		const command = interaction.data.options.getSubCommand(true);

		switch (command.toString()) {
			case 'cat': {
				const data = await request('https://aws.random.cat/meow');
				const { file } = await data.body.json();

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setTitle('A cat picture.')
							.setImage(file)
							.setTimestamp()
							.toJSON(),
					],
				});

				break;
			}
			case 'urban': {
				const message = interaction.data.options.getString('word', true);
				const query = new URLSearchParams(message);
				const data = await request(`https://api.urbandictionary.com/v0/define?term=${query}`);
				const { list } = await data.body.json();

				if (!list.length) {
					return interaction.createMessage({ content: errors.noResult });
				}

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setTitle(`${list[0].word} defined by ${list[0].author}`)
							.setURL(list[0].permalink)
							.setDescription(`👍 ${list[0].thumbs_up} Upvotes | 👎 ${list[0].thumbs_down} Downvotes`)
							.addFields([
								{
									name: 'Definition:',
									value: list[0].definition,
								},
								{
									name: 'Example:',
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
				interaction.createMessage({ content: errors.invalidSubcommand, flags: 64 });
			}
		}
	}
}
