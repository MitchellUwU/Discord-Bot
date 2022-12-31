import Builders from '../../classes/Builders';
import Command from '../../classes/Command';
import * as Lib from 'oceanic.js';
import ms from 'ms';

export default class ViewInfoCommand extends Command {
	override data = new Builders.Command(Lib.ApplicationCommandTypes.USER, 'View Info')
		.setDMPermission(false)
		.toJSON();

	override async execute(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		if (!interaction.data.target) return;
		const user = await this.client.utils.getMember(interaction.guildID, interaction.data.target.id);
		const roles = interaction.guild.roles
			.toArray()
			.filter((role) => user.roles.includes(role.id))
			.sort((prev, next) => next.position - prev.position);

		let onTimeout = '';

		if (user.communicationDisabledUntil) {
			const timeLeft = ms(user.communicationDisabledUntil.getTime() - Date.now(), {
				long: true,
			});

			onTimeout += `<t:${Math.floor(user.communicationDisabledUntil.getTime() / 1000)}:f> (in ${timeLeft})`;
		} else {
			onTimeout += "This user isn't in timeout";
		}

		interaction.createMessage({
			embeds: [
				new Builders.Embed()
					.setRandomColor()
					.setAuthor(`${user.tag} information`, user.avatarURL())
					.setDescription(
						[
							`**- Name:** ${user.tag}`,
							`**- Nickname:** ${user.nick || 'None'}`,
							`**- Join date:** <t:${Math.floor(user.joinedAt!.getTime() / 1000)}:f>`,
							`**- Creation date:** <t:${Math.floor(user.createdAt.getTime() / 1000)}:f>`,
							`**- Is bot:** ${user.bot ? 'Yes' : 'No'}`,
							`**- Is system:** ${user.user.system ? 'Yes' : 'No'}`,
							`**- ID:** ${user.id}`,
							`**- Roles (${user.roles.length}):** ${roles.map((role) => role.mention).join(' ')}`,
							`**- Timeout until:** ${onTimeout}`,
						].join('\n')
					)
					.setThumbnail(user.avatarURL())
					.setTimestamp()
					.toJSON(),
			],
			components: new Builders.ActionRow()
				.addURLButton({ label: 'Avatar URL', url: user.avatarURL() })
				.toJSON(),
			flags: 64,
		});
	}
}
