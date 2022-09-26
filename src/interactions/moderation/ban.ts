import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord-api-types/v10';
import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import CommandInterface from '../../interfaces/command';
import InteractionWrapper from '../../utils/interactionWrapper';
import Lib from 'oceanic.js';
import ms from 'ms';

export default class BanCommand extends CommandInterface {
	public override data = new Builders.Command(ApplicationCommandType.ChatInput, 'ban')
		.setDescription('manage ban')
		.addOptions([
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'add')
				.setDescription('timeout someone')
				.addOptions([
					new Builders.Option(ApplicationCommandOptionType.User, 'user')
						.setDescription('user to ban')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(ApplicationCommandOptionType.String, 'reason')
						.setDescription('why did you ban the user?')
						.toJSON(),
					new Builders.Option(ApplicationCommandOptionType.String, 'time')
						.setDescription(
							'delete messages in specified duration of time (must be between 1 second and 1 week)'
						)
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'remove')
				.setDescription('unban someone')
				.addOptions([
					new Builders.Option(ApplicationCommandOptionType.String, 'id')
						.setDescription('user id to unban')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(ApplicationCommandOptionType.String, 'reason')
						.setDescription('why did you unban the user?')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'view')
				.setDescription('view banned members')
				.addOption(
					new Builders.Option(ApplicationCommandOptionType.String, 'id')
						.setDescription('id of banned member (leave empty if you want to view all banned members)')
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
			case 'add': {
				const user: Lib.Member = interaction.options.getMember('user', true);
				const reason: string = interaction.options.getString('reason', false) || 'no reason?';
				const deleteMessageTime: number = ms(
					`${interaction.options.getString('deleteMessageTime', false) || 0}`
				);

				if (user.id === interaction.user.id) {
					return interaction.createError({ content: "you can't ban yourself" });
				}

				if (user.id === interaction.guild.clientMember.id) {
					return interaction.createError({ content: 'T_T' });
				}

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (!interaction.member.permissions.has('BAN_MEMBERS')) {
						return interaction.createError({ content: 'you need ban members permission to do that...' });
					}

					if (user.id === interaction.guild.ownerID) {
						return interaction.createError({ content: "i can't ban the owner" });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createError({ content: "i can't ban a user with administrator permission" });
					}

					if (
						interaction.getHighestRole(user).position >=
						interaction.getHighestRole(interaction.member).position
					) {
						return interaction.createError({ content: 'that user has higher/same role than you' });
					}
				}

				if (
					interaction.getHighestRole(user).position >=
					interaction.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createError({ content: 'that user has higher/same role than me' });
				}

				if (isNaN(deleteMessageTime)) {
					return interaction.createError({ content: 'invalid time!' });
				}

				if (deleteMessageTime > 604800000 || deleteMessageTime < 0) {
					return interaction.createError({ content: 'time must be between 0 and 1 week' });
				}

				let message: Lib.Message;

				try {
					const channel: Lib.PrivateChannel = await user.user.createDM();
					message = await channel.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setTitle(`you got banned from ${interaction.guild.name} :(`)
								.setDescription(
									`you broke the rules, didn't you?\n\n**guild name:** ${interaction.guild.name}\n**responsible moderator:** ${interaction.user.tag}\n**reason:** ${reason}\n**time:** no time specified`
								)
								.setTimestamp()
								.toJSON(),
						],
					});
				} catch (error: any) {
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				try {
					await user.ban({
						deleteMessageSeconds: deleteMessageTime / 1000,
						reason: reason,
					});
					interaction.createSuccess({ content: 'successfully banned the member!' });
				} catch (error: any) {
					message!.delete();
					interaction.createError({ content: "i can't ban that member sorry! :(" });
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'remove': {
				const user: string = interaction.options.getString('id', true);
				const reason: string = interaction.options.getString('reason', false) || 'no reason?';

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (!interaction.member.permissions.has('BAN_MEMBERS')) {
						return interaction.createError({ content: 'you need ban members permission to do that...' });
					}
				}

				try {
					await interaction.guild.removeBan(user, reason);
					interaction.createSuccess({ content: 'successfully unbanned the member!' });
				} catch (error: any) {
					interaction.createError({ content: "i can't unban that member sorry! :(" });
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'view': {
				const user = interaction.options.getString('id', false);

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (!interaction.member.permissions.has('BAN_MEMBERS')) {
						return interaction.createError({ content: 'you need ban members permission to do that...' });
					}
				}

				if (!user) {
					const fetchedMembers: Lib.Ban[] = await interaction.guild.getBans();
					const bannedMembers: string = fetchedMembers
						.map((member: Lib.Ban) => {
							`**${member.user.tag} (${member.user.id}) is banned for:** ${member.reason}`;
						})
						.join('\n');

					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setTitle('list of banned members')
								.setDescription(bannedMembers || 'no one has been banned yet...')
								.setTimestamp()
								.toJSON(),
						],
						flags: 64,
					});
				} else {
					let member: Lib.Ban;
					try {
						member = await interaction.guild.getBan(user);
					} catch (error: any) {
						return interaction.createError({ content: 'that member is not banned!' });
					}

					interaction.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setAuthor({ name: `${member.user.tag} information`, iconURL: member.user.avatarURL() })
								.setDescription(
									[
										`**- name:** ${member.user.tag}`,
										`**- creation date:** <t:${Math.floor(member.user.createdAt.getTime() / 1000)}:f>`,
										`**- is bot:** ${member.user.bot ? 'yes' : 'no'}`,
										`**- is system:** ${member.user.system ? 'yes' : 'no'}`,
										`**- reason for ban:** ${member.reason}`,
										`**- id:** ${member.user.id}`,
									].join('\n')
								)
								.setThumbnail(member.user.avatarURL())
								.setTimestamp()
								.toJSON(),
						],
						flags: 64,
					});
				}

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
