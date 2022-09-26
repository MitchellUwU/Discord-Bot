import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord-api-types/v10';
import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import CommandInterface from '../../interfaces/command';
import InteractionWrapper from '../../utils/interactionWrapper';
import Lib from 'oceanic.js';

export default class KickCommand extends CommandInterface {
	public override data = new Builders.Command(ApplicationCommandType.ChatInput, 'kick')
		.setDescription('kick someone')
		.addOptions([
			new Builders.Option(ApplicationCommandOptionType.User, 'user')
				.setDescription('user to kick')
				.setRequired(true)
				.toJSON(),
			new Builders.Option(ApplicationCommandOptionType.String, 'reason')
				.setDescription('why did you kick the user?')
				.toJSON(),
		])
		.toJSON();

	public async execute(
		client: BotClient,
		interaction: InteractionWrapper
	): Promise<void | Lib.Message<Lib.TextChannel>> {
		const user: Lib.Member = interaction.options.getMember('user', true);
		const reason: string = interaction.options.getString('reason', false) || 'no reason?';

		if (user.id === interaction.user.id) {
			return interaction.createError({ content: "you can't kick yourself" });
		}

		if (user.id === interaction.guild.clientMember.id) {
			return interaction.createError({ content: 'T_T' });
		}

		if (interaction.user.id !== interaction.guild.ownerID) {
			if (!interaction.member.permissions.has('KICK_MEMBERS')) {
				return interaction.createError({ content: 'you need kick members permission to do that...' });
			}

			if (user.id === interaction.guild.ownerID) {
				return interaction.createError({ content: "i can't kick the owner" });
			}

			if (user.permissions.has('ADMINISTRATOR')) {
				return interaction.createError({ content: "i can't kick a user with administrator permission" });
			}

			if (
				interaction.getHighestRole(user).position >= interaction.getHighestRole(interaction.member).position
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
			interaction.createSuccess({ content: 'successfully kicked the member!' });
		} catch (error: any) {
			message!.delete();
			interaction.createError({ content: "i can't kick that member sorry! :(" });
			client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
		}
	}
}
