import BotClient from '../../classes/Client';
import Builders from '../../classes/Builders';
import Command from '../../classes/Command';
import * as Lib from 'oceanic.js';

export default class ViewInfoCommand extends Command {
	override data = new Builders.Command(Lib.Constants.ApplicationCommandTypes.USER, 'View Info')
		.setDMPermission(false)
		.toJSON();

	async execute(client: BotClient, interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		if (!interaction.data.target) return;
		const user = await client.utils.getMember(interaction.guildID, interaction.data.target.id);
		const roles = interaction.guild.roles
			.toArray()
			.filter((role) => user.roles.includes(role.id))
			.sort((prev, next) => next.position - prev.position);

		interaction.createMessage({
			embeds: [
				new Builders.Embed()
					.setRandomColor()
					.setAuthor(`${user.tag} information`, user.avatarURL())
					.setDescription(
						[
							`**- name:** ${user.tag}`,
							`**- nickname:** ${user.nick || 'none'}`,
							`**- join date:** <t:${Math.floor(user.joinedAt!.getTime() / 1000)}:f>`,
							`**- creation date:** <t:${Math.floor(user.createdAt.getTime() / 1000)}:f>`,
							`**- is bot:** ${user.bot ? 'yes' : 'no'}`,
							`**- is system:** ${user.user.system ? 'yes' : 'no'}`,
							`**- id:** ${user.id}`,
							`**- roles (${user.roles.length}):** ${roles.map((role) => role.mention).join(' ')}`,
						].join('\n')
					)
					.setThumbnail(user.avatarURL())
					.setTimestamp()
					.toJSON(),
			],
			components: new Builders.ActionRow()
				.addURLButton({ label: 'avatar url', url: user.avatarURL() })
				.toJSON(),
      flags: 64,
		});
	}
}
