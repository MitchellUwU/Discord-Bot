import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import ms from 'ms';

export default class SlowmodeCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'slowmode')
		.setDescription('manage slowmode')
		.setDMPermission(false)
		.setDefaultMemberPermissions('MANAGE_CHANNELS')
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'change')
				.setDescription('change channel slowmode')
				.addOptions([
					new Builders.Option(Lib.ApplicationCommandOptionTypes.STRING, 'time')
						.setDescription('slowmode time (must be between 1 second and 6 hours)')
						.setRequired(true)
						.toJSON(),
					new Builders.Option(Lib.ApplicationCommandOptionTypes.CHANNEL, 'channel')
						.setDescription('channel to change slowmode')
						.toJSON(),
				])
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.SUB_COMMAND, 'remove')
				.setDescription('remove channel slowmode')
				.addOption(
					new Builders.Option(Lib.ApplicationCommandOptionTypes.CHANNEL, 'channel')
						.setDescription('channel to remove slowmode')
						.toJSON()
				)
				.toJSON(),
		])
		.toJSON();

	async execute(client: BotClient, interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		if (interaction.user.id !== interaction.guild.ownerID) {
			if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
				return interaction.createMessage({
					embeds: [
						Builders.ErrorEmbed()
							.setDescription(
								"you need manage channels permission to do that! if you're a moderator, please ask an admin or the owner to give you the permission"
							)
							.toJSON(),
					],
				});
			}
		}

		const command = interaction.data.options.getSubCommand(true);

		switch (command.toString()) {
			case 'change': {
				const channel =
					interaction.data.options.getChannel('channel', false)?.completeChannel || interaction.channel;

				const time = interaction.data.options.getString('time', true);
				const realtime = ms(`${time}`);

				if (!(channel instanceof Lib.TextableChannel)) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(
									`${channel.mention} is not a textable channel! please specify a textable channel`
								)
								.toJSON(),
						],
					});
				}

				if (isNaN(realtime)) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription('invalid time! please specify them correctly (example: 5h, 10 minutes etc.)')
								.toJSON(),
						],
					});
				}

				if (realtime > 21600000 || realtime < 1000) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed().setDescription('time must be between 1 second and 6 hours').toJSON(),
						],
					});
				}

				try {
					channel.edit({ rateLimitPerUser: realtime / 1000 });
					interaction.createMessage({
						embeds: [
							Builders.SuccessEmbed()
								.setDescription(
									`successfully changed ${channel.name} slowmode to ${ms(realtime, { long: true })}!`
								)
								.toJSON(),
						],
					});
				} catch (error: any) {
					interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(`i can't change ${channel.name} slowmode sorry! :(\n\n${error}`)
								.toJSON(),
						],
					});
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

				break;
			}
			case 'remove': {
				const channel =
					interaction.data.options.getChannel('channel', false)?.completeChannel || interaction.channel;

				if (!(channel instanceof Lib.TextableChannel)) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(
									`${channel.mention} is not a textable channel! please specify a textable channel`
								)
								.toJSON(),
						],
					});
				}

				try {
					channel.edit({ rateLimitPerUser: 0 });
					interaction.createMessage({
						embeds: [
							Builders.SuccessEmbed()
								.setDescription(`successfully removed ${channel.name} slowmode!`)
								.toJSON(),
						],
					});
				} catch (error: any) {
					interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(`i can't remove ${channel.name} slowmode sorry! :(\n\n${error}`)
								.toJSON(),
						],
					});
					client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
				}

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
