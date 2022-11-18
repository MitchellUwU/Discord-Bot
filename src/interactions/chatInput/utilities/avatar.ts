import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import { AnyGuildTextChannel, CommandInteraction, Constants, Guild } from 'oceanic.js';

export default class AvatarCommand extends Command {
	override data = new Builders.Command(Constants.ApplicationCommandTypes.CHAT_INPUT, 'avatar')
		.setDescription('show avatar')
		.setDMPermission(false)
		.addOptions([
			new Builders.Option(Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'user')
				.setDescription('show user avatar')
				.addOption(
					new Builders.Option(Constants.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('a user')
						.setRequired(false)
						.toJSON()
				)
				.toJSON(),
			new Builders.Option(Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'guild')
				.setDescription('show guild icon (and also banner)')
				.addOption(
					new Builders.Option(Constants.ApplicationCommandOptionTypes.STRING, 'id')
						.setDescription('guild id')
						.setRequired(false)
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	async execute(client: BotClient, interaction: CommandInteraction<AnyGuildTextChannel>) {
		const command = interaction.data.options.getSubCommand(true);

		switch (command.toString()) {
			case 'user': {
				const user =
					interaction.data.options.getMember('user', false) ||
					interaction.data.options.getUser('user', false) ||
					interaction.member;

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setAuthor(`${user.tag}'s avatar`, user.avatarURL())
							.setImage(user.avatarURL())
							.setTimestamp()
							.toJSON(),
					],
					components: new Builders.ActionRow()
						.addURLButton({ label: 'avatar url', url: user.avatarURL() })
						.toJSON(),
				});

				break;
			}
			case 'guild': {
				const id = interaction.data.options.getString('guild', false) || interaction.guildID;
				let guild: Guild;

				try {
					guild = await client.utils.getGuild(id);
				} catch (error) {
					guild = interaction.guild;
				}

				if (!guild.bannerURL() && !guild.iconURL()) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(
									'this guild seem to have no banner or icon... ask the admins to add one! it would be very cool!'
								)
								.toJSON(),
						],
					});
				}

				const embed = new Builders.Embed()
					.setRandomColor()
					.setAuthor(`${guild.name}'s icon and banner`, guild.iconURL()!)
					.setImage(guild.bannerURL()!)
					.setThumbnail(guild.iconURL()!)
					.setTimestamp();

				if (!guild.bannerURL()) {
					embed.setThumbnail('');
					embed.setImage(guild.iconURL()!);
				}

				const actionRow = new Builders.ActionRow();
				const bannerURL = guild.bannerURL();
				const iconURL = guild.iconURL();

				if (iconURL) {
					actionRow.addURLButton({ label: 'icon url', url: iconURL });
				}

				if (bannerURL) {
					actionRow.addURLButton({ label: 'banner url', url: bannerURL });
				}

				interaction.createMessage({
					embeds: [embed.toJSON()],
					components: actionRow.toJSON(),
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
