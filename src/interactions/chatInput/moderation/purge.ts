import BotClient from '../../../classes/Client';
import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import InteractionWrapper from '../../../classes/InteractionWrapper';

export default class PurgeCommand extends Command {
	override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'purge')
		.setDescription('purge messages')
		.setDMPermission(false)
		.addOptions([
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.INTEGER, 'amount')
				.setDescription('amount of messages')
				.setMinMax(1, 100)
				.setRequired(true)
				.toJSON(),
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.USER, 'user')
				.setDescription('delete messages from user')
				.toJSON(),
		])
		.toJSON();

	async execute(client: BotClient, interaction: InteractionWrapper) {
		if (interaction.user.id !== interaction.guild.ownerID) {
			if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
				return interaction.createError({
					content:
						"you need manage messages permission to do that! if you're a moderator, please ask an admin or the owner to give you the permission",
				});
			}
		}

		let user: Lib.User;

		try {
			user = interaction.options.getUser('user', true);
		} catch (error) {
			return interaction.createError({ content: "that user doesn't exist?" });
		}

		const amount = interaction.options.getInteger('amount', true);

		try {
			if (!user) {
				interaction.channel.purge({ limit: amount }).then((deleted: number) => {
					interaction.createSuccess({ content: `successfully deleted ${deleted} messages!` });
				});
			} else {
				interaction.channel
					.purge({ limit: amount, filter: (m) => m.author.id === user.id })
					.then((deleted: number) => {
						interaction.createSuccess({ content: `successfully deleted ${deleted} messages!` });
					});
			}
		} catch (error: any) {
			client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
			interaction.createError({
				content: `i can't delete the messages sorry! :(\n\n${error.name}: ${error.message}`,
			});
		}
	}
}
