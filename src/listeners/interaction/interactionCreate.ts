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
						content: [
							"i don't have enough permissions! please give me following permission:",
							'',
							'**- view channels**',
							'**- manage channels**',
							'**- manage roles**',
							'**- manage server**',
							'**- create invite**',
							'**- change nickname**',
							'**- manage nicknames**',
							'**- kick members**',
							'**- ban members**',
							'**- moderate members**',
							'**- send messages**',
							'**- send messages in threads**',
							'**- create threads**',
							'**- create private threads**',
							'**- embed links**',
							'**- attach files**',
							'**- add reactions**',
							'**- use external emoji**',
							'**- use external stickers**',
							'**- manage messages**',
							'**- read message history**',
							'**- connect**',
							'**- speak**',
							'**- mute members**',
							'**- deafen members**',
							'**- move members**',
						].join('\n'),
					});
				}
			}

			if (client.config.cooldownAmount) {
				const cooldown = client.cooldowns.get(`${interaction.user.id}|${cmd.data.name}`);

				if (cooldown) {
					const expireTime = cooldown + client.config.cooldownAmount;
					const remaining = (expireTime - Date.now()) / 1000;
					return interaction.createError({
						content: `too fast! wait ${remaining.toFixed(1)} more seconds`,
					});
				}

				client.cooldowns.set(`${interaction.user.id}|${cmd.data.name}`, Date.now());
				
				setTimeout(() => {
					client.cooldowns.delete(`${interaction.user.id}|${cmd.data.name}`);
				}, client.config.cooldownAmount);
			}

			try {
				await cmd.execute(client, interaction);
			} catch (error: any) {
				client.utils.logger({ title: 'InteractionCreate', content: error.stack, type: 2 });
				interaction.createError({
					content: `something went wrong! the error is below:\n\n${error}`,
				});
			}
		}
	}
});
