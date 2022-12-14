import Builders from '../../classes/Builders';
import Command from '../../classes/Command';
import * as Lib from 'oceanic.js';

export default class ViewRawCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.MESSAGE, 'View Raw')
		.setDMPermission(false)
		.toJSON();

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		if (!interaction.data.target) return;
		if (!(interaction.data.target instanceof Lib.Message)) return;

		const msg = interaction.data.target;
		const logged = {
			attachments: msg.attachments,
			channelID: msg.channelID,
			components: msg.components || null,
			content: msg.content,
			editedTimestamp: msg.editedTimestamp,
			embeds: msg.embeds,
			guildID: msg.guildID || null,
			mentions: msg.mentions,
			pinned: msg.pinned,
			reactions: msg.reactions,
			stickerItems: msg.stickerItems || null,
			thread: msg.thread || null,
			timestamp: msg.timestamp,
			tts: msg.tts,
			type: msg.type,
		};

		interaction.createMessage({
			content: `\`\`\`${this.client.utils.trim(JSON.stringify(logged, null, 2), 1992)}\`\`\``,
			flags: 64,
		});
	}
}
