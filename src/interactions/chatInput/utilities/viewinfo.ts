import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import ms from 'ms';
import Paginator from '../../../classes/Paginator';
import { errors } from '../../../locales/main';

export default class ViewInfoCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'viewinfo')
		.setDescription('View information. Fun fact: This will never appear in the discord client.')
		.setDMPermission(false)
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'user')
				.setDescription('View user information.')
				.addOption(
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('User to view.')
						.setRequired(false)
						.toJSON()
				)
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'guild')
				.setDescription('View guild information.')
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'channel')
				.setDescription('View channel information.')
				.addOption(
					new Builders.Option(Lib.ApplicationCommandOptionTypes.CHANNEL, 'channel')
						.setDescription('Channel to view.')
						.toJSON()
				)
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'role')
				.setDescription('View role information.')
				.addOption(
					new Builders.Option(Lib.ApplicationCommandOptionTypes.ROLE, 'role')
						.setDescription('Role to view.')
						.setRequired(false)
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		const command = interaction.data.options.getSubCommand(true).toString();

		switch (command) {
			case 'user': {
				const id = interaction.data.options.getUser('user', false)?.id || interaction.user.id;
				try {
					const user = await this.client.utils.getMember(interaction.guildID, id);
					const roles = interaction.guild.roles
						.toArray()
						.filter((role) => user.roles.includes(role.id))
						.sort((prev, next) => next.position - prev.position);

					let onTimeout: string;

					if (user.communicationDisabledUntil) {
						const timeLeft = ms(user.communicationDisabledUntil.getTime() - Date.now(), {
							long: true,
						});

						onTimeout = `<t:${Math.floor(
							user.communicationDisabledUntil.getTime() / 1000
						)}:f> (in ${timeLeft})`;
					} else {
						onTimeout = "This user isn't in timeout";
					}

					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor(`${user.tag}'s information`, user.avatarURL())
								.setDescription(
									[
										`**- Name:** ${user.tag}`,
										`**- Nickname:** ${user.nick || 'None'}`,
										`**- Join date:** <t:${Math.floor(user.joinedAt!.getTime() / 1000)}:f>`,
										`**- Creation date:** <t:${Math.floor(user.createdAt.getTime() / 1000)}:f>`,
										`**- Is bot:** ${user.bot ? 'Yes' : 'No'}`,
										`**- Is system:** ${user.user.system ? 'Yes' : 'No'}`,
										`**- ID:** ${user.id}`,
										`**- Roles (${user.roles.length}):** ${roles.map((role) => role.mention).join(' ')}`,
										`**- Timeout until:** ${onTimeout}`,
									].join('\n')
								)
								.setThumbnail(user.avatarURL())
								.setTimestamp()
								.toJSON(),
						],
						components: new Builders.ActionRow()
							.addURLButton({ label: 'Avatar URL', url: user.avatarURL() })
							.toJSON(),
					});
				} catch (error) {
					const user = await this.client.utils.getUser(id);

					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor(`${user.tag}'s information`, user.avatarURL())
								.setDescription(
									[
										`**- Name:** ${user.tag}`,
										`**- Creation date:** <t:${Math.floor(user.createdAt.getTime() / 1000)}:f>`,
										`**- Is bot:** ${user.bot ? 'Yes' : 'No'}`,
										`**- Is system:** ${user.system ? 'Yes' : 'No'}`,
										`**- ID:** ${user.id}`,
									].join('\n')
								)
								.setThumbnail(user.avatarURL())
								.setTimestamp()
								.toJSON(),
						],
						components: new Builders.ActionRow()
							.addURLButton({ label: 'Avatar URL', url: user.avatarURL() })
							.toJSON(),
					});
				}

				break;
			}
			case 'guild': {
				const verificationLevels = ['None', 'Low', 'Medium', 'High', 'Very high'];
				const mfaLevels = ['Disabled', 'Enabled'];
				const guild = interaction.guild;

				const { channels, threads, members, stickers, emojis } = interaction.guild;

				if (
					members.filter((member) => !member.bot).length === 1 &&
					members.filter((member) => member.bot).length === 1
				)
					await guild.fetchMembers();

				const pages = [
					{
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor(`${guild.name}'s information`, guild.iconURL()!)
								.addFields([
									{
										name: '📃 | General',
										value: [
											`**- Name:** ${guild.name}`,
											`**- Creation date:** <t:${Math.floor(guild.createdAt.getTime() / 1000)}:f>`,
											`**- Owner:** <@${guild.ownerID}>`,
											`**- Roles:** ${guild.roles.size - 1}`,
											`**- Large guild:** ${guild.large ? 'Yes' : 'No'}`,
											`**- NSFW level:** ${guild.nsfwLevel}`,
											`**- Preferred locale:** ${guild.preferredLocale}`,
											`**- 2FA for moderation:** ${mfaLevels[guild.mfaLevel]}`,
											`**- Verification level:** ${verificationLevels[guild.verificationLevel]}`,
											`**- ID:** ${guild.id}`,
											``,
											`**- Description:** ${guild.description || 'None'}`,
										].join('\n'),
									},
								])
								.setThumbnail(guild.iconURL()!)
								.setImage(guild.bannerURL()!)
								.setTimestamp()
								.toJSON(),
						],
					},
					{
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor(`${guild.name}'s information`, guild.iconURL()!)
								.addFields([
									{
										name: '🔨 | Features',
										value: guild.features.join('\n'),
									},
								])
								.setTimestamp()
								.toJSON(),
						],
					},
					{
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor(`${guild.name}'s information`, guild.iconURL()!)
								.addFields([
									{
										name: '👥 | Users',
										value: [
											`**- Members:** ${members.filter((member) => !member.bot).length}`,
											`**- Bots:** ${members.filter((member) => member.bot).length}`,
											``,
											`**- Total:** ${guild.memberCount}`,
										].join('\n'),
									},
								])
								.setTimestamp()
								.toJSON(),
						],
					},
					{
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor(`${guild.name}'s information`, guild.iconURL()!)
								.addFields([
									{
										name: '📕 | Channels',
										value: [
											`**- Text:** ${channels.filter((channel) => channel.type == 0).length}`,
											`**- Voice:** ${channels.filter((channel) => channel.type == 2).length}`,
											`**- Announcement threads:** ${threads.filter((channel) => channel.type == 10).length}`,
											`**- Public threads:** ${threads.filter((channel) => channel.type == 11).length}`,
											`**- Private threads:** ${threads.filter((channel) => channel.type == 12).length}`,
											`**- Categories:** ${channels.filter((channel) => channel.type == 4).length}`,
											`**- Stage voices:** ${channels.filter((channel) => channel.type == 13).length}`,
											`**- Announcements:** ${channels.filter((channel) => channel.type == 5).length}`,
											`**- Forum:** ${channels.filter((channel) => channel.type == 15).length}`,
											``,
											`**- Total channels:** ${channels.size}`,
											`**- Total threads:** ${threads.size}`,
										].join('\n'),
									},
								])
								.setTimestamp()
								.toJSON(),
						],
					},
					{
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor(`${guild.name}'s information`, guild.iconURL()!)
								.addFields([
									{
										name: '😂 | Emojis & Stickers',
										value: [
											`**- Animated:** ${emojis.filter((emoji) => emoji.animated).length}`,
											`**- Static:** ${emojis.filter((emoji) => !emoji.animated).length}`,
											`**- Stickers:** ${stickers ? stickers.length : 0}`,
											``,
											`**- Total:** ${stickers ? stickers.length : 0 + emojis.length}`,
										].join('\n'),
									},
								])
								.setTimestamp()
								.toJSON(),
						],
					},
					{
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor(`${guild.name}'s information`, guild.iconURL()!)
								.addFields([
									{
										name: '🚀 | Nitro statisitcs',
										value: [
											`**- Tier:** ${guild.premiumTier}`,
											`**- Boosts:** ${guild.premiumSubscriptionCount}`,
											`**- Boosters:** ${
												members.filter((member) => (member.premiumSince ? true : false)).length
											}`,
										].join('\n'),
									},
								])
								.setTimestamp()
								.toJSON(),
						],
					},
				];

				const paginator = new Paginator(this.client, pages);
				await paginator.start(interaction, 20000);

				break;
			}
			case 'channel': {
				const type = [
					'Text',
					'DM',
					'Voice',
					'Group dm',
					'Category',
					'News/Announcement',
					"I don't know",
					"I don't know",
					"I don't know",
					"I don't know",
					'News/Announcement thread',
					'Thread',
					'Private thread',
					'Stage voice',
					'Directory',
					'Forum',
				];

				const channel =
					interaction.data.options.getChannel('channel', false)?.completeChannel || interaction.channel;

				if (channel instanceof Lib.PrivateChannel) {
					return interaction.createMessage({ content: errors.notGuildChannel });
				}

				let slowmode: string;

				const embed = new Builders.Embed()
					.setRandomColor()
					.setAuthor(`${channel.name} information`, interaction.guild.iconURL()!)
					.setDescription(
						`**- Name:** ${channel.name}`,
						`**- Type:** ${type[channel.type]}`,
						`**- Creation date:** <t:${Math.floor(channel.createdAt.getTime() / 1000)}:f>`,
						`**- ID:** ${channel.id}`
					)
					.setTimestamp();

				if (channel instanceof Lib.TextableChannel) {
					if (channel.rateLimitPerUser === 0) {
						slowmode = 'none';
					} else {
						slowmode = ms(channel.rateLimitPerUser * 1000, { long: true });
					}

					embed.setDescription(
						`**- Name:** ${channel.name}`,
						`**- Type:** ${type[channel.type]}`,
						`**- NSFW:** ${channel.nsfw ? 'Yes' : 'No'}`,
						`**- Channel position:** ${channel.position}`,
						`**- Creation date:** <t:${Math.floor(channel.createdAt.getTime() / 1000)}:f>`,
						`**- Slowmode time:** ${slowmode}`,
						`**- Topic:** ${channel.topic || 'No topic'}`,
						`**- ID:** ${channel.id}`
					);
				}

				interaction.createMessage({
					embeds: [embed.toJSON()],
				});

				break;
			}
			case 'role': {
				const role = interaction.data.options.getRole('role', false);

				if (!role) {
					const roles = interaction.guild.roles.toArray().sort((prev, next) => next.position - prev.position);

					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setTitle('List of roles.')
								.setDescription(
									roles
										.filter((role) => role.name !== '@everyone')
										.map((role) => role.mention)
										.join('\n') || 'This server have no roles.'
								)
								.setTimestamp()
								.toJSON(),
						],
						flags: 64,
					});
				} else {
					if (interaction.user.id !== interaction.guild.ownerID) {
						if (role.position >= this.client.utils.getHighestRole(interaction.member).position) {
							return interaction.createMessage({ content: errors.viewActionOnHigherRoleUser });
						}
					}

					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor(`${role.name} information`, interaction.guild.iconURL()!)
								.setDescription(
									`**- Name:** ${role.name}`,
									`**- Role position:** ${role.position}`,
									`**- Creation date:** <t:${Math.floor(role.createdAt.getTime() / 1000)}:f>`,
									`**- Managed by integration:** ${role.managed ? 'Yes' : 'No'}`,
									`**- Color:** ${role.color}`,
									`**- ID:** ${role.id}`
								)
								.setTimestamp()
								.toJSON(),
						],
					});
				}

				break;
			}
			default: {
				interaction.createMessage({ content: errors.invalidSubcommand, flags: 64 });
			}
		}
	}
}
