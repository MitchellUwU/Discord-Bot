import Builders from '../../../classes/Builders';
import Command from '../../../classes/Command';
import * as Lib from 'oceanic.js';
import { errors, success } from '../../../locales/main';

export default class PurgeCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.CHAT_INPUT, 'purge')
		.setDescription('Purge messages from the channel or user.')
		.setDMPermission(false)
		.setDefaultMemberPermissions('MANAGE_MESSAGES')
		.addOptions([
			new Builders.Option(Lib.ApplicationCommandOptionTypes.INTEGER, 'amount')
				.setDescription('Amount of messages to delete.')
				.setMinMax(1, 100)
				.setRequired(true)
				.toJSON(),
			new Builders.Option(Lib.ApplicationCommandOptionTypes.USER, 'user')
				.setDescription('User to delete messages from.')
				.toJSON(),
		])
		.toJSON();

	override userPermission = 'MANAGE_MESSAGES' as Lib.PermissionName;

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		let user: Lib.User;

		try {
			user = interaction.data.options.getUser('user', true);
		} catch (error) {
			return interaction.createMessage({ content: errors.invalidUser });
		}

		const amount = interaction.data.options.getInteger('amount', true);

		try {
			if (!user) {
				interaction.channel.purge({ limit: amount }).then((deleted: number) => {
					return interaction.createMessage({ content: success.purge(deleted) });
				});
			} else {
				interaction.channel
					.purge({ limit: amount, filter: (m) => m.author.id === user.id })
					.then((deleted: number) => {
						return interaction.createMessage({ content: success.purgeWithUser(user, deleted) });
					});
			}
		} catch (error) {
			interaction.createMessage({ content: errors.cannotPurge(error) });

			if (error instanceof Error) {
				this.client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
			} else {
				this.client.utils.logger({ title: 'Error', content: error, type: 2 });
			}
		}
	}
}
