import {
	InteractionTypes,
	CommandInteraction,
	ApplicationCommandTypes,
	ComponentInteraction,
} from 'oceanic.js';
import Builders from '../../classes/Builders';
import type Command from '../../classes/Command';
import Event from '../../classes/Event';

export default new Event('interactionCreate', false, async (client, interaction) => {
	switch (interaction.type) {
		case InteractionTypes.APPLICATION_COMMAND: {
			if (!(interaction instanceof CommandInteraction)) return;
			if (!interaction.inCachedGuildChannel()) return;
			let cmd: Command | undefined;

			switch (interaction.data.type) {
				case ApplicationCommandTypes.CHAT_INPUT: {
					cmd = client.handler.getCommand(interaction.data.name, ApplicationCommandTypes.CHAT_INPUT);
					break;
				}
				case ApplicationCommandTypes.MESSAGE: {
					cmd = client.handler.getCommand(interaction.data.name, ApplicationCommandTypes.MESSAGE);
					break;
				}
				case ApplicationCommandTypes.USER: {
					cmd = client.handler.getCommand(interaction.data.name, ApplicationCommandTypes.USER);
					break;
				}
			}

			if (!cmd) return;

			if (!client.config.devIDs.includes(interaction.user.id)) {
				if (client.config.blockedUsers?.includes(interaction.user.id)) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed().setDescription('you were blacklisted by bot developers...').toJSON(),
						],
					});
				}

				if (client.config.blockedGuilds?.includes(interaction.guildID)) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription('this guild was blacklisted by bot developers...')
								.toJSON(),
						],
					});
				}

				if (client.onMaintenance) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed().setDescription('the bot is on maintenance, try again later!').toJSON(),
						],
					});
				}
			}

			if (!interaction.guild.clientMember.permissions.has('ADMINISTRATOR')) {
				if (!interaction.guild.clientMember.permissions.has(BigInt(client.config.requiredPermission))) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription(
									[
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
									].join('\n')
								)
								.toJSON(),
						],
					});
				}
			}

			if (cmd.userPermission && !interaction.member.permissions.has(cmd.userPermission)) {
				return interaction.createMessage({
					embeds: [
						Builders.ErrorEmbed()
							.setDescription(
								`you need ${cmd.userPermission} permission to do that! if you're a moderator, please ask an admin or the owner to give you the permission`
							)
							.toJSON(),
					],
				});
			}

			await cmd.execute(client, interaction);

			break;
		}
		case InteractionTypes.MESSAGE_COMPONENT: {
			if (!(interaction instanceof ComponentInteraction)) return;
			if (!interaction.inCachedGuildChannel()) return;

			const component = client.handler.components.get(interaction.data.customID);
			const parentData = client.handler.activeComponents[interaction.user.id];

			if (!component || !parentData) return;

			if (interaction.type !== InteractionTypes.MESSAGE_COMPONENT) return;
			if (interaction.message.interaction?.id !== parentData.id) return;
			if (interaction.channelID !== parentData.channelID) return;
			if (interaction.guildID !== parentData.guildID) return;
			if (interaction.user.id !== parentData.user.id) return;

			await component.execute(client, interaction, parentData);
			delete client.handler.activeComponents[interaction.user.id];

			break;
		}
	}
});
