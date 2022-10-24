import BotClient from '../../client';
import Builders from '../../utils/builders';
import Event from '../../interfaces/event';
import InteractionWrapper from '../../utils/interactionWrapper';
import * as Lib from 'oceanic.js';
import { ExecuteReturnType } from '../../types/additional';

export default class InteractionCreateEvent extends Event<'interactionCreate'> {
	public override data = new Builders.Event('interactionCreate', false).toJSON();

	public async execute(client: BotClient, rawInteraction: Lib.Interaction): ExecuteReturnType {
		switch (rawInteraction.type) {
			case Lib.InteractionTypes.APPLICATION_COMMAND: {
				if (!(rawInteraction instanceof Lib.CommandInteraction)) return;

				const cmd = client.interactions.get(rawInteraction.data.name);
				if (!cmd) return;

				const interaction = new InteractionWrapper(client, rawInteraction);

				if (!client.config.devIDs.includes(interaction.user.id)) {
					if (client.config.blockedUsers?.includes(interaction.user.id)) {
						return interaction.createError({ content: 'you were blacklisted by bot developers...' });
					}

					if (client.config.blockedGuilds?.includes(interaction.guildID)) {
						return interaction.createError({ content: 'this guild was blacklisted by bot developers...' });
					}

					if (client.onMaintenance) {
						return interaction.createError({ content: 'the bot is on maintenance, try again later!' });
					}
				}

				if (!interaction.guild.clientMember.permissions.has('ADMINISTRATOR')) {
					if (!interaction.guild.clientMember.permissions.has(BigInt(client.config.requiredPermission))) {
						return interaction.createError({
							content:
								"i don't have enough permissions! please give me following permission:\n\n**- view channels**\n**- manage channels**\n**- manage roles**\n**- manage server**\n**- create invite**\n**- change nickname**\n**- manage nicknames**\n**- kick members**\n**- ban members**\n**- moderate members**\n**- send messages**\n**- send messages in threads**\n**- create public threads**\n**- create private threads**\n**- embed links**\n**- attach files**\n**- add reactions**\n**- use external emoji**\n**- use external stickers**\n**- manage messages**\n**- read message history**\n**- connect**\n**- speak**\n**- mute members**\n**- deafen members**\n**- move members**",
						});
					}
				}

				try {
					await cmd.execute(client, interaction);
				} catch (error: any) {
					client.utils.logger({ title: 'InteractionCreate', content: error.stack, type: 2 });
					interaction.createError({
						content: `i found a error while i was trying to execute the command!\n\n**error type:** ${error.name}\n**error message:** ${error.message}\n**listener:** catch error listener at ${this.data.name} event`,
					});
				}
			}
		}
	}
}
