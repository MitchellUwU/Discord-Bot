import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';

export default class KickCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'kick')
		.setDescription('kick someone')
		.setDMPermission(false)
		.setDefaultMemberPermissions('KICK_MEMBERS')
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
				.setDescription('user to kick')
				.setRequired(true)
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
				.setDescription('why did you kick the user?')
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.BOOLEAN, 'dm')
				.setDescription('whether to dm the user or not (default to true)')
				.toJSON(),
		])
		.toJSON();

	override userPermission = 'KICK_MEMBERS' as Lib.PermissionName;

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		let user: Lib.Member;

		try {
			user = interaction.data.options.getMember('user', true);
		} catch (error) {
			try {
				const name = interaction.data.options.getUser('user', true).tag;
				return interaction.createMessage({
					embeds: [Builders.ErrorEmbed().setDescription(`${name} is not in this server!`).toJSON()],
				});
			} catch (error) {
				return interaction.createMessage({
					embeds: [Builders.ErrorEmbed().setDescription("that user doesn't exist?").toJSON()],
				});
			}
		}

		const reason = interaction.data.options.getString('reason', false) || 'no reason?';
		const dmOption = interaction.data.options.getBoolean('dm', false) ?? true;

		if (user.id === interaction.user.id) {
			return interaction.createMessage({
				embeds: [Builders.ErrorEmbed().setDescription("you can't kick yourself").toJSON()],
			});
		}

		if (user.id === interaction.guild.clientMember.id) {
			return interaction.createMessage({
				embeds: [Builders.ErrorEmbed().setDescription('T_T').toJSON()],
			});
		}

		if (interaction.user.id !== interaction.guild.ownerID) {
			if (user.id === interaction.guild.ownerID) {
				return interaction.createMessage({
					embeds: [Builders.ErrorEmbed().setDescription("i can't kick the owner").toJSON()],
				});
			}

			if (user.permissions.has('ADMINISTRATOR')) {
				return interaction.createMessage({
					embeds: [
						Builders.ErrorEmbed()
							.setDescription(`${user.tag} have administrator permission, i can't kick them!`)
							.toJSON(),
					],
				});
			}

			if (
				this.client.utils.getHighestRole(user).position >=
				this.client.utils.getHighestRole(interaction.member).position
			) {
				return interaction.createMessage({
					embeds: [
						Builders.ErrorEmbed().setDescription(`${user.tag} have higher (or same) role than you`).toJSON(),
					],
				});
			}
		}

		if (
			this.client.utils.getHighestRole(user).position >=
			this.client.utils.getHighestRole(interaction.guild.clientMember).position
		) {
			return interaction.createMessage({
				embeds: [
					Builders.ErrorEmbed().setDescription(`${user.tag} have higher (or same) role than me`).toJSON(),
				],
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
				if (error instanceof Error) {
					this.client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				} else {
					this.client.utils.logger({ title: 'Error', content: error, type: 2 });
				}
			}
		}

		try {
			await user.kick(reason);

			let description = `successfully kicked ${user.tag}!`;

			if (dmOption && !dmSuccess) {
				description += " but i can't dm them.";
			}

			interaction.createMessage({
				embeds: [Builders.SuccessEmbed().setDescription(description).toJSON()],
			});
		} catch (error) {
			message!.delete();
			interaction.createMessage({
				embeds: [
					Builders.ErrorEmbed().setDescription(`i can't kick ${user.tag} sorry! :(\n\n${error}`).toJSON(),
				],
			});

			if (error instanceof Error) {
				this.client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
			} else {
				this.client.utils.logger({ title: 'Error', content: error, type: 2 });
			}
		}
	}
}
