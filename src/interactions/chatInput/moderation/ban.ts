import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import ms from 'ms';
import { dm, errors, others, success } from '../../../locales/main';

export default class BanCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'ban')
		.setDescription('Manage ban. Fun fact: This will never appear in the discord client.')
		.setDMPermission(false)
		.setDefaultMemberPermissions('BAN_MEMBERS')
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'add')
				.setDescription('Ban someone.')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('User to ban.')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('Reason for banning.')
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'time')
						.setDescription(
							'Delete messages in specified duration of time. (Time must be between 1 second and 1 week)'
						)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.BOOLEAN, 'dm')
						.setDescription('Whether to dm the user or not. (Default to true)')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'addsoft')
				.setDescription('Softban someone.')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('User to softban.')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('Reason for softbanning.')
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'time')
						.setDescription(
							'Delete messages in specified duration of time. (must be between 1 second and 1 week)'
						)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.BOOLEAN, 'dm')
						.setDescription('Whether to dm the user or not. (default to true)')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'remove')
				.setDescription('Unban someone.')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'id')
						.setDescription('User ID to unban.')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('Reason for unbanning.')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'view')
				.setDescription('View banned members')
				.toJSON(),
		])
		.toJSON();

	override userPermission = 'BAN_MEMBERS' as Lib.PermissionName;

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		const command = interaction.data.options.getSubCommand(true).toString();

		switch (command) {
			case 'add': {
				let user: Lib.Member | Lib.User;

				try {
					user = interaction.data.options.getMember('user', true);
				} catch (error) {
					try {
						user = interaction.data.options.getUser('user', true);
					} catch (error) {
						return interaction.createMessage({ content: errors.invalidUser });
					}
				}

				const reason = interaction.data.options.getString('reason', false) || others.defaultReason;
				const deleteMessageTime = ms(
					`${interaction.data.options.getString('deleteMessageTime', false) || 0}`
				);
				const dmOption = interaction.data.options.getBoolean('dm', false) ?? true;

				if (user.id === interaction.user.id) {
					return interaction.createMessage({ content: errors.banActionOnSelf });
				}

				if (user.id === interaction.guild.clientMember.id) {
					return interaction.createMessage({ content: errors.banActionOnBot });
				}

				if (interaction.user.id !== interaction.guild.ownerID && user instanceof Lib.Member) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createMessage({ content: errors.banActionOnOwner });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({ content: errors.banActionOnAdmin });
					}

					if (
						this.client.utils.getHighestRole(user).position >=
						this.client.utils.getHighestRole(interaction.member).position
					) {
						return interaction.createMessage({ content: errors.banActionOnHigherRoleUser });
					}
				}

				if (
					user instanceof Lib.Member &&
					this.client.utils.getHighestRole(user).position >=
						this.client.utils.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createMessage({ content: errors.banActionOnHigherRoleBot });
				}

				if (isNaN(deleteMessageTime)) {
					return interaction.createMessage({ content: errors.invalidTime });
				}

				if (deleteMessageTime > 604800000 || deleteMessageTime < 0) {
					return interaction.createMessage({ content: errors.timeExceedOrBelowLimitBan });
				}

				let message: Lib.Message;
				let dmSuccess = true;

				if (dmOption && user instanceof Lib.Member) {
					try {
						const channel = await user.user.createDM();
						message = await channel.createMessage({ content: dm.ban(interaction, reason) });
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
					await interaction.guild.createBan(user.id, {
						deleteMessageSeconds: deleteMessageTime / 1000,
						reason: reason,
					});

					interaction.createMessage({ content: success.ban(user, dmSuccess) });
				} catch (error) {
					message!.delete().catch(() => {});
					interaction.createMessage({ content: errors.cannotBan(error) });

					if (error instanceof Error) {
						this.client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
					} else {
						this.client.utils.logger({ title: 'Error', content: error, type: 2 });
					}
				}

				break;
			}
			case 'addsoft': {
				let user: Lib.Member;

				try {
					user = interaction.data.options.getMember('user', true);
				} catch (error) {
					try {
						interaction.data.options.getUser('user', true);
						return interaction.createMessage({ content: errors.userNotInGuild });
					} catch (error) {
						return interaction.createMessage({ content: errors.invalidUser });
					}
				}

				const reason = interaction.data.options.getString('reason', false) || others.defaultReason;
				const deleteMessageTime = ms(
					`${interaction.data.options.getString('deleteMessageTime', false) || 0}`
				);
				const dmOption = interaction.data.options.getBoolean('dm', false) ?? true;

				if (user.id === interaction.user.id) {
					return interaction.createMessage({ content: errors.softBanActionOnSelf });
				}

				if (user.id === interaction.guild.clientMember.id) {
					return interaction.createMessage({ content: errors.softBanActionOnBot });
				}

				if (interaction.user.id !== interaction.guild.ownerID && user instanceof Lib.Member) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createMessage({ content: errors.softBanActionOnOwner });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({ content: errors.softBanActionOnAdmin });
					}

					if (
						this.client.utils.getHighestRole(user).position >=
						this.client.utils.getHighestRole(interaction.member).position
					) {
						return interaction.createMessage({ content: errors.softBanActionOnHigherRoleUser });
					}
				}

				if (
					user instanceof Lib.Member &&
					this.client.utils.getHighestRole(user).position >=
						this.client.utils.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createMessage({ content: errors.softBanActionOnHigherRoleBot });
				}

				if (isNaN(deleteMessageTime)) {
					return interaction.createMessage({ content: errors.invalidTime });
				}

				if (deleteMessageTime > 604800000 || deleteMessageTime < 0) {
					return interaction.createMessage({ content: errors.timeExceedOrBelowLimitSoftban });
				}

				let message: Lib.Message;
				let dmSuccess = true;

				if (dmOption) {
					try {
						const channel = await user.user.createDM();
						message = await channel.createMessage({ content: dm.softban(interaction, reason) });
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
					await interaction.guild.createBan(user.id, {
						deleteMessageSeconds: deleteMessageTime / 1000,
						reason: reason,
					});

					await interaction.guild.removeBan(user.id, 'Softban');

					interaction.createMessage({ content: success.softban(user, dmSuccess) });
				} catch (error) {
					message!.delete().catch();
					interaction.createMessage({ content: errors.cannotSoftBan(error) });

					if (error instanceof Error) {
						this.client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
					} else {
						this.client.utils.logger({ title: 'Error', content: error, type: 2 });
					}
				}

				break;
			}
			case 'remove': {
				const user = interaction.data.options.getString('id', true);

				try {
					await this.client.utils.getUser(user);
				} catch (error) {
					return interaction.createMessage({ content: errors.invalidUser });
				}

				const reason = interaction.data.options.getString('reason', false) || others.defaultReason;
				let banned: Lib.Ban;

				try {
					banned = await interaction.guild.getBan(user);
				} catch (error) {
					return interaction.createMessage({ content: errors.notBanned });
				}

				try {
					await interaction.guild.removeBan(user, reason);
					interaction.createMessage({ content: success.unban(banned.user) });
				} catch (error) {
					interaction.createMessage({ content: errors.cannotUnban(error) });

					if (error instanceof Error) {
						this.client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
					} else {
						this.client.utils.logger({ title: 'Error', content: error, type: 2 });
					}
				}

				break;
			}
			case 'view': {
				const fetchedMembers = await interaction.guild.getBans();
				const bannedMembers = fetchedMembers
					.map((member: Lib.Ban) => {
						return `**${member.user.tag} (${member.user.id}) is banned for:** ${member.reason}`;
					})
					.join('\n');

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setTitle('List of banned members')
							.setDescription(bannedMembers || 'No one has been banned yet.')
							.setTimestamp()
							.toJSON(),
					],
					flags: 64,
				});

				break;
			}
			default: {
				interaction.createMessage({ content: errors.invalidSubcommand, flags: 64 });
			}
		}
	}
}
