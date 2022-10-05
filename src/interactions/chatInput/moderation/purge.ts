import BotClient from '../../../client';
import Builders from '../../../utils/builders';
import Command from '../../../interfaces/command';
import * as Lib from 'oceanic.js';
import InteractionWrapper from '../../../utils/interactionWrapper';

export default class PurgeCommand extends Command {
	public override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.CHAT_INPUT, 'purge')
		.setDescription('purge messages')
		.addOption(
			new Builders.Option(Lib.Constants.ApplicationCommandOptionTypes.INTEGER, 'amount')
				.setDescription('amount of messages')
				.setMinValue(1)
				.setMaxValue(100)
				.setRequired(true)
				.toJSON()
		)
		.toJSON();

	public async execute(
		client: BotClient,
		interaction: InteractionWrapper
	): Promise<void | Lib.Message<Lib.TextChannel>> {
		if (interaction.user.id !== interaction.guild.ownerID) {
			if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
				return interaction.createError({
					content:
						"you need manage messages permission to do that! if you're a moderator, please ask an admin or the owner to give you the permission",
				});
			}
		}

		const amount = interaction.options.getInteger('amount', true);

		try {
			interaction.channel.purge({ limit: amount }).then((deleted: number) => {
				interaction.createSuccess({ content: `successfully deleted ${deleted} messages!` });
			});
		} catch (error: any) {
			client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
			interaction.createError({
				content: `i can't delete the messages sorry! :(\n\n${error.name}: ${error.message}`,
			});
		}
	}
}
