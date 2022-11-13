import { InteractionTypes, CommandInteraction } from 'oceanic.js';
import Event from '../../classes/Event';
import InteractionWrapper from '../../classes/InteractionWrapper';

export default new Event('interactionCreate', false, async (client, rawInteraction) => {
	switch (rawInteraction.type) {
		case InteractionTypes.APPLICATION_COMMAND: {
			if (!(rawInteraction instanceof CommandInteraction)) return;
			if (!rawInteraction.inCachedGuildChannel()) return;

			const cmd = client.handler.chatInputCommands.get(rawInteraction.data.name);
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
							"i don't have enough permissions! please give me following permission:\n\n**- view channels**\n**- manage channels**\n**- manage roles**\n**- manage server**\n**- create invite**\n**- change nickname**\n**- manage nicknames**\n**- kick members**\n**- ban members**\n**- moderate members**\n**- send messages**\n**- send messages in threads**\n**- create threads**\n**- create private threads**\n**- embed links**\n**- attach files**\n**- add reactions**\n**- use external emoji**\n**- use external stickers**\n**- manage messages**\n**- read message history**\n**- connect**\n**- speak**\n**- mute members**\n**- deafen members**\n**- move members**",
					});
				}
			}

			try {
				await cmd.execute(client, interaction);
			} catch (error) {
				client.utils.logger({ title: 'InteractionCreate', content: error, type: 2 });
				interaction.createError({
					content: `something went wrong! the error is below:\n\n${error}`,
				});
			}
		}
	}
});
