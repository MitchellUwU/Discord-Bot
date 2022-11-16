import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import { PrivateChannel, Constants, TextableChannel } from 'oceanic.js';
import InteractionWrapper from '../../../classes/InteractionWrapper';
import ms from 'ms';

export default class ViewInfoCommand extends Command {
	override data = new Builders.Command(Constants.ApplicationCommandTypes.CHAT_INPUT, 'viewinfo')
		.setDescription('view user info or guild info')
		.setDMPermission(false)
		.addOptions([
			new Builders.Option(Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'user')
				.setDescription('view user info')
				.addOption(
					new Builders.Option(Constants.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('a user')
						.setRequired(false)
						.toJSON()
				)
				.toJSON(),
			new Builders.Option(Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'guild')
				.setDescription('view guild info')
				.toJSON(),
			new Builders.Option(Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'channel')
				.setDescription('view channel info')
				.addOption(
					new Builders.Option(Constants.ApplicationCommandOptionTypes.CHANNEL, 'channel')
						.setDescription('a channel')
						.toJSON()
				)
				.toJSON(),
			new Builders.Option(Constants.ApplicationCommandOptionTypes.SUB_COMMAND, 'role')
				.setDescription('view role info')
				.addOption(
					new Builders.Option(Constants.ApplicationCommandOptionTypes.ROLE, 'role')
						.setDescription('a role')
						.setRequired(true)
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	async execute(client: BotClient, interaction: InteractionWrapper) {
		const command = interaction.options.getSubCommand(true);

		switch (command.toString()) {
			case 'user': {
				const id = interaction.options.getUser('user', false)?.id || interaction.user.id;
				try {
					const user = await client.utils.getMember(interaction.guildID, id);
					const roles = interaction.guild.roles
						.toArray()
						.filter((role) => user.roles.includes(role.id))
						.sort((prev, next) => next.position - prev.position);

					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor(`${user.tag} information`, user.avatarURL())
								.setDescription(
									[
										`**- name:** ${user.tag}`,
										`**- nickname:** ${user.nick || 'none'}`,
										`**- join date:** <t:${Math.floor(user.joinedAt!.getTime() / 1000)}:f>`,
										`**- creation date:** <t:${Math.floor(user.createdAt.getTime() / 1000)}:f>`,
										`**- is bot:** ${user.bot ? 'yes' : 'no'}`,
										`**- is system:** ${user.user.system ? 'yes' : 'no'}`,
										`**- id:** ${user.id}`,
										`**- roles (${user.roles.length}):** ${roles.map((role) => role.mention).join(' ')}`,
									].join('\n')
								)
								.setThumbnail(user.avatarURL())
								.setTimestamp()
								.toJSON(),
						],
						components: new Builders.ActionRow()
							.addURLButton({ label: 'avatar url', url: user.avatarURL() })
							.toJSON(),
					});
				} catch (error) {
					const user = await client.utils.getUser(id);

					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor(`${user.tag} information`, user.avatarURL())
								.setDescription(
									[
										`**- name:** ${user.tag}`,
										`**- creation date:** <t:${Math.floor(user.createdAt.getTime() / 1000)}:f>`,
										`**- is bot:** ${user.bot ? 'yes' : 'no'}`,
										`**- is system:** ${user.system ? 'yes' : 'no'}`,
										`**- id:** ${user.id}`,
									].join('\n')
								)
								.setThumbnail(user.avatarURL())
								.setTimestamp()
								.toJSON(),
						],
						components: new Builders.ActionRow()
							.addURLButton({ label: 'avatar url', url: user.avatarURL() })
							.toJSON(),
					});
				}

				break;
			}
			case 'guild': {
				const verificationLevels = ['none', 'low', 'medium', 'high', 'very high'];
				const mfaLevels = ['disabled', 'enabled'];
				const guild = interaction.guild;
				const channels = guild.channels;
				const threads = guild.threads;
				const members = guild.members;
				const stickers = guild.stickers;
				const emojis = guild.emojis;

				const actionRow = new Builders.ActionRow();
				const bannerURL = guild.bannerURL();
				const iconURL = guild.iconURL();

				if (iconURL) {
					actionRow.addURLButton({ label: 'icon url', url: iconURL });
				}

				if (bannerURL) {
					actionRow.addURLButton({ label: 'banner url', url: bannerURL });
				}

				if (
					members.filter((member) => !member.bot).length === 1 &&
					members.filter((member) => member.bot).length === 1
				)
					await guild.fetchMembers();

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setAuthor(`${guild.name}'s information`, guild.iconURL()!)
							.addFields([
								{
									name: '📃 | general',
									value: [
										`**- name:** ${guild.name}`,
										`**- created:** <t:${Math.floor(guild.createdAt.getTime() / 1000)}:f>`,
										`**- owner:** <@${guild.ownerID}>`,
										`**- roles:** ${guild.roles.size - 1}`,
										`**- large guild:** ${guild.large ? 'yes' : 'no'}`,
										`**- nsfw level:** ${guild.nsfwLevel}`,
										`**- preferred locale:** ${guild.preferredLocale}`,
										`**- 2fa for moderation:** ${mfaLevels[guild.mfaLevel]}`,
										`**- verification level:** ${verificationLevels[guild.verificationLevel]}`,
										`**- id:** ${guild.id}`,
										``,
										`**- description:** ${guild.description || 'no description...'}`,
									].join('\n'),
								},
								{
									name: '👥 | users',
									value: [
										`**- members:** ${members.filter((member) => !member.bot).length} (may be inaccurate.)`,
										`**- bots:** ${members.filter((member) => member.bot).length} (may be inaccurate.)`,
										``,
										`**- total:** ${guild.memberCount}`,
									].join('\n'),
								},
								{
									name: '📕 | channels',
									value: [
										`**- text:** ${channels.filter((channel) => channel.type == 0).length}`,
										`**- voice:** ${channels.filter((channel) => channel.type == 2).length}`,
										`**- threads:** ${threads.filter((channel) => channel.type == 10 && 12 && 11).length}`,
										`**- categories:** ${channels.filter((channel) => channel.type == 4).length}`,
										`**- stage voices:** ${channels.filter((channel) => channel.type == 13).length}`,
										`**- announcements:** ${channels.filter((channel) => channel.type == 5).length}`,
										`**- forum:** ${channels.filter((channel) => channel.type == 15).length}`,
										``,
										`**- total:** ${channels.size}`,
									].join('\n'),
								},
								{
									name: '😂 | emojis & stickers',
									value: [
										`**- animated:** ${emojis.filter((emoji) => emoji.animated).length}`,
										`**- static:** ${emojis.filter((emoji) => !emoji.animated).length}`,
										`**- stickers:** ${stickers ? stickers.length : 0}`,
										``,
										`**- total:** ${stickers ? stickers.length : 0 + emojis.length}`,
									].join('\n'),
								},
								{
									name: '🚀 | nitro statisitcs',
									value: [
										`**- tier:** ${guild.premiumTier}`,
										`**- boosts:** ${guild.premiumSubscriptionCount}`,
										`**- boosters:** ${
											members.filter((member) => (member.premiumSince ? true : false)).length
										}`,
									].join('\n'),
								},
							])
							.setThumbnail(guild.iconURL()!)
							.setImage(guild.bannerURL()!)
							.setTimestamp()
							.toJSON(),
					],
					components: actionRow.toJSON(),
				});

				break;
			}
			case 'channel': {
				const type = [
					'text',
					'dm',
					'voice',
					'group dm',
					'category',
					'news/announcement',
					'how did you even get here?',
					'how did you even get here?',
					'how did you even get here?',
					'how did you even get here?',
					'news/announcement thread',
					'thread',
					'private thread',
					'stage voice',
					'directory',
					'forum',
				];

				const channel =
					interaction.options.getChannel('channel', false)?.completeChannel || interaction.channel;

				if (channel instanceof PrivateChannel) {
					return interaction.createError({
						content: 'the channel must be a guild channel',
					});
				}

				let slowmode: string;

				const embed = new Builders.Embed()
					.setRandomColor()
					.setAuthor(`${channel.name} information`, interaction.guild.iconURL()!)
					.setDescription(
						`**- name:** ${channel.name}`,
						`**- type:** ${type[channel.type]}`,
						`**- creation date:** <t:${Math.floor(channel.createdAt.getTime() / 1000)}:f>`,
						`**- id:** ${channel.id}`
					)
					.setTimestamp();

				if (channel instanceof TextableChannel) {
					if (channel.rateLimitPerUser === 0) {
						slowmode = 'none';
					} else {
						slowmode = ms(channel.rateLimitPerUser * 1000, { long: true });
					}

					embed.setDescription(
						`**- name:** ${channel.name}`,
						`**- type:** ${type[channel.type]}`,
						`**- nsfw:** ${channel.nsfw ? 'yes' : 'no'}`,
						`**- channel position:** ${channel.position}`,
						`**- creation date:** <t:${Math.floor(channel.createdAt.getTime() / 1000)}:f>`,
						`**- slowmode time:** ${slowmode}`,
						`**- topic:** ${channel.topic || 'no topic'}`,
						`**- id:** ${channel.id}`
					);
				}

				interaction.createMessage({
					embeds: [embed.toJSON()],
				});

				break;
			}
			case 'role': {
				const role = interaction.options.getRole('role', true);

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (role.position > client.utils.getHighestRole(interaction.member).position) {
						return interaction.createError({ content: 'that role is higher/same role than you' });
					}
				}

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setAuthor(`${role.name} information`, interaction.guild.iconURL()!)
							.setDescription(
								`**- name:** ${role.name}`,
								`**- role position:** ${role.position}`,
								`**- creation date:** <t:${Math.floor(role.createdAt.getTime() / 1000)}:f>`,
								`**- managed by integration:** ${role.managed ? 'yes' : 'no'}`,
								`**- color:** ${role.color}`,
								`**- id:** ${role.id}`
							)
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
