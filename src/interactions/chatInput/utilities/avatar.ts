import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import { errors } from '../../../locales/main';

export default class AvatarCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'avatar')
		.setDescription('Show avatar. Fun fact: This will never appear in the discord client.')
		.setDMPermission(false)
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'user')
				.setDescription('Show user avatar.')
				.addOption(
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('User to view.')
						.setRequired(false)
						.toJSON()
				)
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'guild')
				.setDescription('Show guild icon and banner.')
				.toJSON(),
		])
		.toJSON();

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		const command = interaction.data.options.getSubCommand(true).toString();

		switch (command) {
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
						.addURLButton({ label: 'Avatar URL', url: user.avatarURL() })
						.toJSON(),
				});

				break;
			}
			case 'guild': {
				const guild = interaction.guild;

				if (!guild.bannerURL() && !guild.iconURL()) {
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription('This guild have no banner or icon.').toJSON()],
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
					actionRow.addURLButton({ label: 'Icon URL', url: iconURL });
				}

				if (bannerURL) {
					actionRow.addURLButton({ label: 'Banner URL', url: bannerURL });
				}

				interaction.createMessage({
					embeds: [embed.toJSON()],
					components: actionRow.toJSON(),
				});

				break;
			}
			default: {
				interaction.createMessage({ content: errors.invalidSubcommand, flags: 64 });
			}
		}
	}
}
