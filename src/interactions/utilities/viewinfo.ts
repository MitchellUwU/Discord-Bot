import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord-api-types/v10';
import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import CommandInterface from '../../interfaces/command';
import Lib from 'oceanic.js';
import ms from 'ms';
import InteractionWrapper from '../../utils/interactionWrapper';

export default class ViewInfoCommand extends CommandInterface {
	public override data = new Builders.Command(ApplicationCommandType.ChatInput, 'viewinfo')
		.setDescription('view user info or guild info')
		.addOptions([
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'user')
				.setDescription('view user info')
				.addOption(
					new Builders.Option(ApplicationCommandOptionType.User, 'user')
						.setDescription('a user')
						.setRequired(false)
						.toJSON()
				)
				.toJSON(),
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'guild')
				.setDescription('view guild info')
				.toJSON(),
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'channel')
				.setDescription('view channel info')
				.toJSON(),
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'role')
				.setDescription('view role info')
				.addOption(
					new Builders.Option(ApplicationCommandOptionType.Role, 'role')
						.setDescription('a role')
						.setRequired(true)
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	public async execute(client: BotClient, interaction: InteractionWrapper): Promise<void> {
		let command = interaction.options.getSubCommand<Lib.SubCommandArray>(false);
		if (!command) command = ['unknown'];

		switch (command.toString()) {
			case 'user': {
				const id: string = interaction.options.getUser('user', false)?.id || interaction.user.id;
				try {
					const user: Lib.Member = await interaction.getMember(id);

					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor({ name: `${user.tag} information`, iconURL: user.avatarURL() })
								.setDescription(
									[
										`**- name:** ${user.tag}`,
										`**- nickname:** ${user.nick || 'none'}`,
										`**- join date:** <t:${Math.floor(user.joinedAt!.getTime() / 1000)}:f>`,
										`**- creation date:** <t:${Math.floor(user.createdAt.getTime() / 1000)}:f>`,
										`**- is bot:** ${user.bot ? 'yes' : 'no'}`,
										`**- is system:** ${user.user.system ? 'yes' : 'no'}`,
										`**- id:** ${user.id}`,
										`**- roles (${user.roles.length}):** <@&${
											user.roles.join('><@&').replace('@everyone', '') || 'none'
										}>`.replace('<@&>', ''),
									].join('\n')
								)
								.setThumbnail(user.avatarURL())
								.setTimestamp()
								.toJSON(),
						],
					});
				} catch (error: any) {
					const user: Lib.User = await interaction.getUser(id);

					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor({ name: `${user.tag} information`, iconURL: user.avatarURL() })
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
					});
				}

				break;
			}
			case 'guild': {
				const verificationLevels: string[] = ['none', 'low', 'medium', 'high', 'very high'];
				const mfaLevels: string[] = ['disabled', 'enabled'];
				const guild: Lib.Guild = interaction.guild;
				const channels = guild.channels;
				const threads = guild.threads;
				const members = guild.members;
				const stickers = guild.stickers;
				const emojis = guild.emojis;

				if (
					members.filter((member: Lib.Member) => !member.bot).length === 1 &&
					members.filter((member: Lib.Member) => member.bot).length === 1
				)
					await guild.fetchMembers();

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setAuthor({ name: `${guild.name}'s information`, iconURL: guild.iconURL()! })
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
				});

				break;
			}
			case 'channel': {
				const type: Array<string> = [
					'text',
					'dm',
					'voice',
					'group dm',
					'category',
					'news/announcement',
					'news/announcement thread',
					'public thread',
					'private thread',
					'stage voice',
					'directory',
					'forum',
				];

				const channel: Lib.TextChannel = interaction.channel;
				let slowmode: string;

				if (channel.rateLimitPerUser === 0) {
					slowmode = 'none';
				} else {
					slowmode = ms(channel.rateLimitPerUser * 1000, { long: true });
				}

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setAuthor({
								name: `${channel.name} information`,
								iconURL: interaction.guild.iconURL()!,
							})
							.setDescription(
								[
									`**- name:** ${channel.name}`,
									`**- type:** ${type[channel.type]}`,
									`**- nsfw:** ${channel.nsfw ? 'yes' : 'no'}`,
									`**- channel position:** ${channel.position}`,
									`**- creation date:** <t:${Math.floor(channel.createdAt.getTime() / 1000)}:f>`,
									`**- slowmode time:** ${slowmode}`,
									`**- topic:** ${channel.topic || 'no topic'}`,
									`**- id:** ${channel.id}`,
								].join('\n')
							)
							.setTimestamp()
							.toJSON(),
					],
				});

				break;
			}
			case 'role': {
				const role: Lib.Role = interaction.options.getRole('role', true);

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (role.position > interaction.getHighestRole(interaction.member).position) {
						return interaction.createError({ content: 'that role is higher/same role than you' });
					}
				}

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setAuthor({ name: `${role.name} information`, iconURL: interaction.guild.iconURL()! })
							.setDescription(
								[
									`**- name:** ${role.name}`,
									`**- role position:** ${role.position}`,
									`**- creation date:** <t:${Math.floor(role.createdAt.getTime() / 1000)}:f>`,
									`**- managed by integration:** ${role.managed ? 'yes' : 'no'}`,
									`**- id:** ${role.id}`,
								].join('\n')
							)
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
