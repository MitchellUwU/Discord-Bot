import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import ms from 'ms';

export default class BanCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'ban')
		.setDescription('manage ban')
		.setDMPermission(false)
		.setDefaultMemberPermissions('BAN_MEMBERS')
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'add')
				.setDescription('ban someone')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('user to ban')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('why did you ban the user?')
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'time')
						.setDescription(
							'delete messages in specified duration of time (must be between 1 second and 1 week)'
						)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.BOOLEAN, 'dm')
						.setDescription('whether to dm the user or not (default to true)')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'addsoft')
				.setDescription('softban someone')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
						.setDescription('user to softban')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('why did you softban the user?')
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'time')
						.setDescription(
							'delete messages in specified duration of time (must be between 1 second and 1 week)'
						)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.BOOLEAN, 'dm')
						.setDescription('whether to dm the user or not (default to true)')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'remove')
				.setDescription('unban someone')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'id')
						.setDescription('user id to unban')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'reason')
						.setDescription('why did you unban the user?')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'view')
				.setDescription('view banned members')
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
						return interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription("that user doesn't exist?").toJSON()],
						});
					}
				}

				const reason = interaction.data.options.getString('reason', false) || 'no reason?';
				const deleteMessageTime = ms(
					`${interaction.data.options.getString('deleteMessageTime', false) || 0}`
				);
				const dmOption = interaction.data.options.getBoolean('dm', false) ?? true;

				if (user.id === interaction.user.id) {
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription("you can't ban yourself").toJSON()],
					});
				}

				if (user.id === interaction.guild.clientMember.id) {
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription('T_T').toJSON()],
					});
				}

				if (interaction.user.id !== interaction.guild.ownerID && user instanceof Lib.Member) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription("i can't ban the owner").toJSON()],
						});
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({
							embeds: [
								Builders.ErrorEmbed()
									.setDescription(`${user.tag} have administrator permission, i can't ban them!`)
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
								Builders.ErrorEmbed()
									.setDescription(`${user.tag} have higher (or same) role than you`)
									.toJSON(),
							],
						});
					}
				}

				if (
					user instanceof Lib.Member &&
					this.client.utils.getHighestRole(user).position >=
						this.client.utils.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed().setDescription(`${user.tag} have higher (or same) role than me`).toJSON(),
						],
					});
				}

				if (isNaN(deleteMessageTime)) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription('invalid time! please specify them correctly (example: 5h, 10 minutes etc.)')
								.toJSON(),
						],
					});
				}

				if (deleteMessageTime > 604800000 || deleteMessageTime < 0) {
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription('time must be between 0 and 1 week').toJSON()],
					});
				}

				let message: Lib.Message;
				let dmSuccess = true;

				if (dmOption && user instanceof Lib.Member) {
					try {
						const channel = await user.user.createDM();
						message = await channel.createMessage({
							embeds: [
								new Builders.Embed()
									.setRandomColor()
									.setTitle(`you got banned from ${interaction.guild.name} :(`)
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
					await interaction.guild.createBan(user.id, {
						deleteMessageSeconds: deleteMessageTime / 1000,
						reason: reason,
					});

					interaction.createMessage({
						embeds: [
							Builders.SuccessEmbed()
								.setDescription(
									`successfully banned ${user.tag}!${
										dmOption ? (dmSuccess ? '' : " but i can't dm them") : ''
									}`
								)
								.toJSON(),
						],
					});
				} catch (error) {
					message!.delete();
					interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed().setDescription(`i can't ban ${user.tag} sorry! :(\n\n${error}`).toJSON(),
						],
					});

					if (error instanceof Error) {
						this.client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
					} else {
						this.client.utils.logger({ title: 'Error', content: error, type: 2 });
					}
				}

				break;
			}
			case 'addSoft': {
				let user: Lib.Member;

				try {
					user = interaction.data.options.getMember('user', true);
				} catch (error) {
					try {
						interaction.data.options.getUser('user', true);
						return interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription("that user isn't in this server!").toJSON()],
						});
					} catch (error) {
						return interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription("that user doesn't exist?").toJSON()],
						});
					}
				}

				const reason = interaction.data.options.getString('reason', false) || 'no reason?';
				const deleteMessageTime = ms(
					`${interaction.data.options.getString('deleteMessageTime', false) || 0}`
				);
				let dmOption = interaction.data.options.getBoolean('dm', false);
				if (dmOption === undefined) dmOption = true;

				if (user.id === interaction.user.id) {
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription("you can't softban yourself").toJSON()],
					});
				}

				if (user.id === interaction.guild.clientMember.id) {
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription('T_T').toJSON()],
					});
				}

				if (interaction.user.id !== interaction.guild.ownerID && user instanceof Lib.Member) {
					if (user.id === interaction.guild.ownerID) {
						return interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription("i can't softban the owner").toJSON()],
						});
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createMessage({
							embeds: [
								Builders.ErrorEmbed()
									.setDescription(`${user.tag} have administrator permission, i can't softban them!`)
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
								Builders.ErrorEmbed()
									.setDescription(`${user.tag} have higher (or same) role than you`)
									.toJSON(),
							],
						});
					}
				}

				if (
					user instanceof Lib.Member &&
					this.client.utils.getHighestRole(user).position >=
						this.client.utils.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed().setDescription(`${user.tag} have higher (or same) role than me`).toJSON(),
						],
					});
				}

				if (isNaN(deleteMessageTime)) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription('invalid time! please specify them correctly (example: 5h, 10 minutes etc.)')
								.toJSON(),
						],
					});
				}

				if (deleteMessageTime > 604800000 || deleteMessageTime < 0) {
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription('time must be between 0 and 1 week').toJSON()],
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
									.setTitle(`you got softbanned from ${interaction.guild.name} :(`)
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
					await interaction.guild.createBan(user.id, {
						deleteMessageSeconds: deleteMessageTime / 1000,
						reason: reason,
					});

					await interaction.guild.removeBan(user.id, 'softban');

					interaction.createMessage({
						embeds: [
							Builders.SuccessEmbed()
								.setDescription(
									`successfully softbanned ${user.tag}!${
										dmOption ? (dmSuccess ? '' : " but i can't dm them") : ''
									}`
								)
								.toJSON(),
						],
					});
				} catch (error) {
					message!.delete();
					interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(`i can't softban ${user.tag} sorry! :(\n\n${error}`)
								.toJSON(),
						],
					});

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
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription("that user doesn't exist?").toJSON()],
					});
				}

				const reason = interaction.data.options.getString('reason', false) || 'no reason?';
				let banned: Lib.Ban;

				try {
					banned = await interaction.guild.getBan(user);
				} catch (error) {
					const name = await this.client.utils.getUser(user);
					return interaction.createMessage({
						embeds: [Builders.ErrorEmbed().setDescription(`${name} is not banned!`).toJSON()],
					});
				}

				try {
					await interaction.guild.removeBan(user, reason);
					interaction.createMessage({
						embeds: [
							Builders.SuccessEmbed().setDescription(`successfully unbanned ${banned.user.tag}!`).toJSON(),
						],
					});
				} catch (error) {
					interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(`i can't unban ${banned.user.tag} sorry! :(\n\n${error}`)
								.toJSON(),
						],
					});

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
							.setTitle('list of banned members')
							.setDescription(bannedMembers || 'no one has been banned yet...')
							.setTimestamp()
							.toJSON(),
					],
					flags: 64,
				});

				break;
			}
			default: {
				interaction.createMessage({
					embeds: [
						Builders.ErrorEmbed()
							.setDescription('wait for a bit or until the bot restart and try again')
							.toJSON(),
					],
				});
			}
		}
	}
}
