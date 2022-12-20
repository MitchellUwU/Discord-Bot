import { InteractionTypes, CommandInteraction, ComponentInteraction } from 'oceanic.js';
import Builders from '../../classes/Builders';
import Event from '../../classes/Event';
import type { ArrayParentData, ParentData } from '../../types/options';

export default new Event('interactionCreate', false, async (client, interaction) => {
	switch (interaction.type) {
		case InteractionTypes.APPLICATION_COMMAND: {
			if (!(interaction instanceof CommandInteraction)) return;
			if (!interaction.inCachedGuildChannel()) return;

			const cmd = client.handler.getCommand(interaction.data.name, interaction.data.type);

			if (!cmd) {
				return interaction.createMessage({
					embeds: [Builders.ErrorEmbed().setDescription("that command doesn't exist?").toJSON()],
				});
			}

			if (!interaction.guild.clientMember.permissions.has('ADMINISTRATOR')) {
				if (!interaction.guild.clientMember.permissions.has(1615410359415n)) {
					return interaction.createMessage({
						embeds: [
							Builders.ErrorEmbed()
								.setDescription([
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
								])
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

			await cmd.execute(interaction);

			break;
		}
		case InteractionTypes.MESSAGE_COMPONENT: {
			if (!(interaction instanceof ComponentInteraction)) return;
			if (!interaction.inCachedGuildChannel()) return;

			const arrayData = interaction.data.customID.split('|') as ArrayParentData;

			const parentData: ParentData = {
				userID: arrayData[0],
				interactionID: arrayData[1],
				componentID: arrayData[2],
				addition: arrayData[3],
			};

			const component = client.handler.components.get(parentData.componentID);

			if (!component || !parentData) return;
			if (interaction.type !== InteractionTypes.MESSAGE_COMPONENT) return;
			if (interaction.message.interaction?.id !== parentData.interactionID) return;
			if (interaction.user.id !== parentData.userID) return;
			
			await component.execute(interaction, parentData);

			break;
		}
	}
});
