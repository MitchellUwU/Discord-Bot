import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import { request } from 'undici';

export default class FetchCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'fetch')
		.setDescription('fetch some random stuff from the internet')
		.setDMPermission(false)
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'cat')
				.setDescription('get a cat picture')
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'urban')
				.setDescription('search urban dictionary')
				.addOption(
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'word')
						.setDescription('a word or sentence or whatever')
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
							.setTitle('a cat picture :D')
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
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription('no result found :(').toJSON()],
					});
				}

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
						Builders.ErrorEmbed()
							.setDescription('wait for a bit or until the bot restart and try again')
							.toJSON(),
					],
				});
			}
		}
	}
}
