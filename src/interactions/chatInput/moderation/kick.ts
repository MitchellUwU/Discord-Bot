import BotClient from '../../../client';
import Builders from '../../../utils/builders';
import Command from '../../../interfaces/command';
import InteractionWrapper from '../../../utils/interactionWrapper';
import * as Lib from 'oceanic.js';

export default class KickCommand extends Command {
	public override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'kick')
		.setDescription('kick someone')
		.addOptions([
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.USER, 'user')
				.setDescription('user to kick')
				.setRequired(true)
				.toJSON(),
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.STRING, 'reason')
				.setDescription('why did you kick the user?')
				.toJSON(),
		])
		.toJSON();

	public async execute(
		client: BotClient,
		interaction: InteractionWrapper
	): Promise<void | Lib.Message<Lib.TextChannel>> {
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

		const reason: string = interaction.options.getString('reason', false) || 'no reason?';

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
				interaction.getHighestRole(user).position >= interaction.getHighestRole(interaction.member).position
			) {
				return interaction.createError({ content: `${user.tag} have higher (or same) role than you` });
			}
		}

		if (
			interaction.getHighestRole(user).position >=
			interaction.getHighestRole(interaction.guild.clientMember).position
		) {
			return interaction.createError({
				content: `${user.tag} have higher (or same) role than me, please ask an admin or the owner to fix this`,
			});
		}

		let message: Lib.Message;

		try {
			const channel: Lib.PrivateChannel = await user.user.createDM();
			message = await channel.createMessage({
				embeds: [
					new Builders.Embed()
						.setRandomColor()
						.setTitle(`you got kicked from ${interaction.guild.name} :(`)
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
			await user.kick(reason);
			interaction.createSuccess({ content: `successfully kicked ${user.tag}!` });
		} catch (error: any) {
			message!.delete();
			interaction.createError({
				content: `i can't kick ${user.tag} sorry! :(\n\n${error.name}: ${error.message}`,
			});
			client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
		}
	}
}
