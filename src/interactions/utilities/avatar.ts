import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import CommandInterface from '../../interfaces/command';
import * as Lib from 'oceanic.js';
import InteractionWrapper from '../../utils/interactionWrapper';

export default class AvatarCommand extends CommandInterface {
	public override data = new Builders.Command(ApplicationCommandType.ChatInput, 'avatar')
		.setDescription('show avatar')
		.addOptions([
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'user')
				.setDescription('show user avatar')
				.addOption(
					new Builders.Option(ApplicationCommandOptionType.User, 'user')
						.setDescription('a user')
						.setRequired(false)
						.toJSON()
				)
				.toJSON(),
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'guild')
				.setDescription('show guild icon (and also banner)')
				.addOption(
					new Builders.Option(ApplicationCommandOptionType.String, 'id')
						.setDescription('guild id')
						.setRequired(false)
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
			case 'user': {
				const user: Lib.Member | Lib.User =
					interaction.options.getMember('user', false) ||
					interaction.options.getUser('user', false) ||
					interaction.member;

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setAuthor({ name: `${user.tag}'s avatar`, iconURL: user.avatarURL() })
							.setImage(user.avatarURL())
							.setTimestamp()
							.toJSON(),
					],
				});

				break;
			}
			case 'guild': {
				const id = interaction.options.getString('guild', false) || interaction.guildID;
				let guild: Lib.Guild;

				try {
					guild = await client.utils.getGuild(id);
				} catch (error) {
					guild = interaction.guild;
				}

				const embed = new Builders.Embed()
					.setRandomColor()
					.setAuthor({ name: `${guild.name}'s icon and banner`, iconURL: guild.iconURL()! })
					.setDescription('icon link (unavailable)\nbanner link (unavailable)')
					.setImage(guild.bannerURL()!)
					.setThumbnail(guild.iconURL()!)
					.setTimestamp();

				if (!guild.bannerURL()) {
					embed.setThumbnail('');
					embed.setImage(guild.iconURL()!);
				}

				const jsonEmbed = embed.toJSON();

				if (guild.bannerURL())
					jsonEmbed.description = jsonEmbed.description?.replace(
						'banner link (unavailable)',
						`[banner link](${guild.bannerURL()})`
					);
				if (guild.iconURL())
					jsonEmbed.description = jsonEmbed.description?.replace(
						'icon link (unavailable)',
						`[icon link](${guild.iconURL()})`
					);

				jsonEmbed.description = jsonEmbed.description?.replace(
					'{iconURL}\n{bannerURL}',
					'this guild have nothing'
				);

				interaction.createMessage({
					embeds: [jsonEmbed],
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
