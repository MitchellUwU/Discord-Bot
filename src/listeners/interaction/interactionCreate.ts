import { InteractionTypes, CommandInteraction, ComponentInteraction } from 'oceanic.js';
import Event from '../../classes/Event';
import { errors } from '../../locales/main';
import type { ArrayParentData, ParentData } from '../../types/options';

export default new Event('interactionCreate', false, async (client, interaction) => {
	switch (interaction.type) {
		case InteractionTypes.APPLICATION_COMMAND: {
			if (!(interaction instanceof CommandInteraction)) return;
			if (!interaction.inCachedGuildChannel()) return;

			const cmd = client.handler.getCommand(interaction.data.name, interaction.data.type);

			if (!cmd) {
				return interaction.createMessage({ content: errors.invalidCommand, flags: 64 });
			}

			if (!interaction.guild.clientMember.permissions.has('ADMINISTRATOR')) {
				if (!interaction.guild.clientMember.permissions.has(1615410359415n)) {
					return interaction.createMessage({ content: errors.invalidBotPerms });
				}
			}

			if (cmd.userPermission && !interaction.member.permissions.has(cmd.userPermission)) {
				return interaction.createMessage({ content: errors.notEnoughUserPerms(cmd) });
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
			if (interaction.message.interaction?.id !== parentData.interactionID) return;
			if (interaction.user.id !== parentData.userID) return;

			await component.execute(interaction, parentData);

			break;
		}
	}
});
