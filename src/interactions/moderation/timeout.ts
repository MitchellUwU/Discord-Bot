import { ApplicationCommandType, ApplicationCommandOptionType, ButtonStyle } from 'discord-api-types/v10';
import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import CommandInterface from '../../interfaces/command';
import InteractionWrapper from '../../utils/interactionWrapper';
import * as Lib from 'oceanic.js';
import ms from 'ms';

export default class TimeoutCommand extends CommandInterface {
	public override data = new Builders.Command(ApplicationCommandType.ChatInput, 'timeout')
		.setDescription('manage timeout')
		.addOptions([
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'add')
				.setDescription('timeout someone')
				.addOptions([
					new Builders.Option(ApplicationCommandOptionType.User, 'user')
						.setDescription('user to timeout')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(ApplicationCommandOptionType.String, 'time')
						.setDescription('duration of time (must be between 1 second and 1 week)')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(ApplicationCommandOptionType.String, 'reason')
						.setDescription('why did you timeout the user?')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'remove')
				.setDescription('untimeout someone')
				.addOptions([
					new Builders.Option(ApplicationCommandOptionType.User, 'user')
						.setDescription('user to untimeout')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(ApplicationCommandOptionType.String, 'reason')
						.setDescription('why did you untimeout the user?')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(ApplicationCommandOptionType.Subcommand, 'view')
				.setDescription('view someone timeout')
				.addOption(
					new Builders.Option(ApplicationCommandOptionType.User, 'user')
						.setDescription('user to view timeout')
						.setRequired(true)
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
				const time: number = ms(`${interaction.options.getString('time', true)}`);
				const date: string = new Date(Date.now() + time).toISOString();

				if (user.id === interaction.user.id) {
					return interaction.createError({ content: "you can't timeout yourself" });
				}

				if (user.id === interaction.guild.clientMember.id) {
					return interaction.createError({ content: 'T_T' });
				}

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (!interaction.member.permissions.has('MODERATE_MEMBERS')) {
						return interaction.createError({ content: 'you need moderate members permission to do that...' });
					}

					if (user.id === interaction.guild.ownerID) {
						return interaction.createError({ content: "i can't timeout the owner" });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createError({
							content: "i can't timeout a user with administrator permission",
						});
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

				if (isNaN(time)) {
					return interaction.createError({ content: 'invalid time!' });
				}

				if (time > 604800000 || time < 1000) {
					return interaction.createError({ content: 'time must be between 1 second and 1 week' });
				}

				let message: Lib.Message;

				try {
					const channel: Lib.PrivateChannel = await user.user.createDM();
					message = await channel.createMessage({
						embeds: [
							new Builders.Embed()
								.setRandomColor()
								.setTitle(`you got timeout from ${interaction.guild.name} :(`)
								.setDescription(
									`you broke the rules, didn't you?\n\n**guild name:** ${
										interaction.guild.name
									}\n**responsible moderator:** ${
										interaction.user.tag
									}\n**reason:** ${reason}\n**time:** ${ms(time, { long: true })}`
								)
								.setTimestamp()
								.toJSON(),
						],
					});
				} catch (error: any) {
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				try {
					await user.edit({
						communicationDisabledUntil: date,
						reason: reason,
					});
					interaction.createSuccess({ content: 'successfully timeout the member!' });
				} catch (error: any) {
					message!.delete();
					interaction.createError({ content: "i can't timeout that member sorry! :(" });
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'remove': {
				const user: Lib.Member = interaction.options.getMember('user', true);
				const reason: string = interaction.options.getString('reason', false) || 'no reason?';

				if (interaction.user.id !== interaction.guild.ownerID) {
					if (!interaction.member.permissions.has('MODERATE_MEMBERS')) {
						return interaction.createError({ content: 'you need moderate members permission to do that...' });
					}

					if (user.id === interaction.guild.ownerID) {
						return interaction.createError({ content: "i can't untimeout the owner" });
					}

					if (user.permissions.has('ADMINISTRATOR')) {
						return interaction.createError({
							content: "i can't untimeout a user with administrator permission",
						});
					}

					if (
						interaction.getHighestRole(user).position >=
						interaction.getHighestRole(interaction.member).position
					) {
						return interaction.createError({ content: 'that user has higher/same role than you' });
					}
				}

				if (user.id === interaction.user.id) {
					return interaction.createError({ content: "you can't untimeout yourself" });
				}

				if (
					interaction.getHighestRole(user).position >=
					interaction.getHighestRole(interaction.guild.clientMember).position
				) {
					return interaction.createError({ content: 'that user has higher/same role than me' });
				}

				try {
					await user.edit({
						communicationDisabledUntil: new Date(Date.now()).toISOString(),
						reason: reason,
					});
					interaction.createSuccess({ content: 'successfully untimeout the member!' });
				} catch (error: any) {
					interaction.createError({ content: "i can't untimeout that member sorry! :(" });
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'view': {
				const user: Lib.Member = interaction.options.getMember('user', true);

				if (!user.communicationDisabledUntil) {
					return interaction.createError({
						content: 'that user is not in timeout!',
					});
				}

				const component = (state: boolean) => {
					return new Builders.Button(ButtonStyle.Danger, 'untimeout', 'untimeout user').setDisabled(state);
				};

				interaction.createMessage({
					embeds: [
						new Builders.Embed()
							.setRandomColor()
							.setAuthor({ name: `${user.tag}'s timeout`, iconURL: user.avatarURL() })
							.setDescription(
								`${user.tag} is timeout until <t:${Math.floor(
									user.communicationDisabledUntil.getTime() / 1000
								)}:f> (in ${ms(user.communicationDisabledUntil.getTime() - Date.now(), {
									long: true,
								})})`
							)
							.setTimestamp()
							.toJSON(),
					],
					components: [new Builders.ActionRow().addComponent(component(false).toJSON()).toJSON()],
				});

				const collector = client.collectors.createNewCollector({
					client: client,
					authorID: interaction.user.id,
					interaction: interaction,
					interactionType: Lib.ComponentInteraction,
					componentType: 2,
					time: 20000,
					max: 1,
				});

				collector.on('collect', async (i: Lib.ComponentInteraction<Lib.TextChannel>) => {
					const helper = new InteractionWrapper(client, i);

					if (interaction.user.id !== interaction.guild.ownerID) {
						if (!interaction.member.permissions.has('MODERATE_MEMBERS')) {
							return helper.createError({ content: 'you need moderate members permission to do that...' });
						}

						if (user.id === interaction.guild.ownerID) {
							return helper.createError({ content: "i can't untimeout the owner" });
						}

						if (user.permissions.has('ADMINISTRATOR')) {
							return helper.createError({
								content: "i can't untimeout a user with administrator permission",
							});
						}

						if (
							interaction.getHighestRole(user).position >=
							interaction.getHighestRole(interaction.member).position
						) {
							return helper.createError({ content: 'that user has higher/same role than you' });
						}
					}

					if (user.id === interaction.user.id) {
						return helper.createError({ content: "you can't untimeout yourself" });
					}

					if (
						interaction.getHighestRole(user).position >=
						interaction.getHighestRole(interaction.guild.clientMember).position
					) {
						return helper.createError({ content: 'that user has higher/same role than me' });
					}

					try {
						await user.edit({
							communicationDisabledUntil: new Date(Date.now()).toISOString(),
							reason: 'untimeout using view timeout command',
						});
						helper.createSuccess({ content: 'successfully untimeout the member!' });
					} catch (error: any) {
						helper.createError({ content: "i can't untimeout that member sorry! :(" });
						client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
					}
				});

				collector.once('end', async () => {
					interaction.editOriginal({
						components: [new Builders.ActionRow().addComponent(component(true).toJSON()).toJSON()],
					});
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
