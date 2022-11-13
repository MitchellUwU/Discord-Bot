import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import InteractionWrapper from '../../../classes/InteractionWrapper';
import * as Lib from 'oceanic.js';

export default class KickCommand extends Command {
	override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'kick')
		.setDescription('kick someone')
		.setDMPermission(false)
		.setDefaultMemberPermissions('KICK_MEMBERS')
		.addOptions([
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.USER, 'user')
				.setDescription('user to kick')
				.setRequired(true)
				.toJSON(),
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'reason')
				.setDescription('why did you kick the user?')
				.toJSON(),
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.BOOLEAN, 'dm')
				.setDescription('dm the user (default to true)')
				.toJSON(),
		])
		.toJSON();

	async execute(client: BotClient, interaction: InteractionWrapper) {
		if (interaction.user.id !== interaction.guild.ownerID) {
			if (!interaction.member.permissions.has('KICK_MEMBERS')) {
				return interaction.createError({
					content:
						"you need kick members permission to do that! if you're a moderator, please ask an admin or the owner to give you the permission",
				});
			}
		}

		let user: Lib.Member;

		try {
			user = interaction.options.getMember('user', true);
		} catch (error) {
			try {
				const name = interaction.options.getUser('user', true).tag;
				return interaction.createError({ content: `${name} is not in this server!` });
			} catch (error) {
				return interaction.createError({ content: "that user doesn't exist?" });
			}
		}

		const reason = interaction.options.getString('reason', false) || 'no reason?';
		let dmOption = interaction.options.getBoolean('dm', false);

		if (dmOption === undefined) dmOption = true;

		if (user.id === interaction.user.id) {
			return interaction.createError({ content: "you can't kick yourself" });
		}

		if (user.id === interaction.guild.clientMember.id) {
			return interaction.createError({ content: 'T_T' });
		}

		if (interaction.user.id !== interaction.guild.ownerID) {
			if (user.id === interaction.guild.ownerID) {
				return interaction.createError({ content: "i can't kick the owner" });
			}

			if (user.permissions.has('ADMINISTRATOR')) {
				return interaction.createError({
					content: `${user.tag} have administrator permission, i can't kick them!`,
				});
			}

			if (
				client.utils.getHighestRole(user).position >= client.utils.getHighestRole(interaction.member).position
			) {
				return interaction.createError({ content: `${user.tag} have higher (or same) role than you` });
			}
		}

		if (
			client.utils.getHighestRole(user).position >=
			client.utils.getHighestRole(interaction.guild.clientMember).position
		) {
			return interaction.createError({
				content: `${user.tag} have higher (or same) role than me, please ask an admin or the owner to fix this`,
			});
		}

		let message: Lib.Message;
		let dmSuccess = true;

		if (dmOption) {
			try {
				const channel = await user.user.createDM();
				message = await channel.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setTitle(`you got kicked from ${interaction.guild.name} :(`)
							.setDescription(
								`you broke the rules, didn't you?`,
								``,
								`**guild name:** ${interaction.guild.name}`,
								`**responsible moderator:** ${interaction.user.tag}`,
								`**reason:** ${reason}`
							)
							.setTimestamp()
							.toJSON(),
					],
				});
			} catch (error) {
				dmSuccess = false;
				client.utils.logger({ title: 'KickCommand', content: error, type: 2 });
			}
		}

		try {
			await user.kick(reason);
			interaction.createSuccess({
				content: `successfully kicked ${user.tag}!${
					dmOption ? (dmSuccess ? " but i can't dm them" : '') : ''
				}`,
			});
		} catch (error) {
			message!.delete();
			interaction.createError({
				content: `i can't kick ${user.tag} sorry! :(\n\n${error}`,
			});
			client.utils.logger({ title: 'Error', content: error, type: 2 });
		}
	}
}
