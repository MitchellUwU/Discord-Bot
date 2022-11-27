import type BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';

export default class PurgeCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'purge')
		.setDescription('purge messages from the channel or from the user')
		.setDMPermission(false)
		.setDefaultMemberPermissions('MANAGE_MESSAGES')
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.INTEGER, 'amount')
				.setDescription('amount of messages to delete')
				.setMinMax(1, 100)
				.setRequired(true)
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
				.setDescription('which user to delete messages from')
				.toJSON(),
		])
		.toJSON();

	override async execute(client: BotClient, interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		if (interaction.user.id !== interaction.guild.ownerID) {
			if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
				return interaction.createMessage({
					embeds: [
						Builders.ErrorEmbed()
							.setDescription(
								"you need manage messages permission to do that! if you're a moderator, please ask an admin or the owner to give you the permission"
							)
							.toJSON(),
					],
				});
			}
		}

		let user: Lib.User;

		try {
			user = interaction.data.options.getUser('user', true);
		} catch (error) {
			return interaction.createMessage({
				embeds: [Builders.ErrorEmbed().setDescription("that user doesn't exist?").toJSON()],
			});
		}

		const amount = interaction.data.options.getInteger('amount', true);

		try {
			if (!user) {
				interaction.channel.purge({ limit: amount }).then((deleted: number) => {
					return interaction.createMessage({
						embeds: [
							Builders.SuccessEmbed().setDescription(`successfully deleted ${deleted} messages!`).toJSON(),
						],
					});
				});
			} else {
				interaction.channel
					.purge({ limit: amount, filter: (m) => m.author.id === user.id })
					.then((deleted: number) => {
						return interaction.createMessage({
							embeds: [
								Builders.SuccessEmbed().setDescription(`successfully deleted ${deleted} messages!`).toJSON(),
							],
						});
					});
			}
		} catch (error: any) {
			client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
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
