import BotClient from './Client';
import Builders from './Builders';
import * as Lib from 'oceanic.js';
import { AnyGuildInteractionNonAutoComplete } from '../types/additional';

// Wrapper for interaction (which is also a wrapper of raw interaction) to make things easier (i don't want to do monkey patch shit, it makes my life hell).

export default class InteractionWrapper {
	private client: BotClient;
	raw: AnyGuildInteractionNonAutoComplete;
	options: Lib.InteractionOptionsWrapper;
	channel: Lib.AnyGuildTextChannel;
	guild: Lib.Guild;
	guildID: string;
	member: Lib.Member;
	user: Lib.User;
	constructor(client: BotClient, interaction: AnyGuildInteractionNonAutoComplete) {
		let options;

		if (
			interaction instanceof Lib.ComponentInteraction ||
			interaction instanceof Lib.ModalSubmitInteraction
		) {
			options = new Lib.InteractionOptionsWrapper([] as Lib.InteractionOptions[], null);
		} else {
			options = interaction.data.options;
		}

		this.client = client;
		this.raw = interaction;
		this.options = options;
		this.channel = interaction.channel;
		this.guild = interaction.guild;
		this.guildID = interaction.guildID;
		this.member = interaction.member;
		this.user = interaction.user;
	}

	/**
	 * Edit interaction response.
	 * @param content Content of interaction.
	 * @returns Promise<void>
	 */

	async editOriginal(content: Lib.InteractionContent) {
		content.content = this.client.utils.cleanContent(content.content);
		if (this.raw.acknowledged) {
			return this.raw.editOriginal(content);
		} else {
			return this.raw.createMessage(content);
		}
	}

	/**
	 * Defer interaction response.
	 * @param flag Defer with a flags.
	 * @returns Promise<void>
	 */

	async deferResponse(flag?: number) {
		return this.raw.defer(flag);
	}

	/**
	 * Send a respond to interaction.
	 * @param content Content of interaction.
	 * @returns Promise<void>
	 */

	async createMessage(content: Lib.InteractionContent) {
		content.content = this.client.utils.cleanContent(content.content);
		if (this.raw.acknowledged) {
			return this.raw.createFollowup(content);
		} else {
			return this.raw.createMessage(content);
		}
	}

	/**
	 * Send error respond to interaction.
	 * @param content Content of interaction.
	 * @param hidden Response with ephemeral message or not.
	 * @returns Promise<void>
	 */

	async createError(content: Lib.InteractionContent, hidden?: boolean) {
		const embed = new Builders.Embed()
			.setColor('red')
			.setTitle('⛔ error!')
			.setDescription(this.client.utils.cleanContent(content.content) || 'idk what went wrong sorry :(')
			.setTimestamp();

		content.content = '';

		if (hidden === undefined || hidden) {
			return this.createMessage({
				embeds: [embed.toJSON()],
				flags: 64,
				...content,
			});
		} else {
			return this.createMessage({
				embeds: [embed.toJSON()],
				files: content.files,
				...content,
			});
		}
	}

	/**
	 * Send success respond to interaction.
	 * @param content Content of interaction.
	 * @param hidden Response with ephemeral message or not.
	 * @returns Promise<void>
	 */

	async createSuccess(content: Lib.InteractionContent, hidden?: boolean) {
		const embed = new Builders.Embed()
			.setColor('green')
			.setTitle('✅ success!')
			.setDescription(
				this.client.utils.cleanContent(content.content) || 'idk what thing successfully been done sorry :('
			)
			.setTimestamp();

		content.content = '';

		if (hidden === undefined || hidden) {
			return this.createMessage({
				embeds: [embed.toJSON()],
				flags: 64,
				...content,
			});
		} else {
			return this.createMessage({
				embeds: [embed.toJSON()],
				files: content.files,
				...content,
			});
		}
	}

	/**
	 * Send warning respond to interaction.
	 * @param content Content of interaction.
	 * @param hidden Response with ephemeral message or not.
	 * @returns Promise<void>
	 */

	async createWarn(content: Lib.InteractionContent, hidden?: boolean) {
		const embed = new Builders.Embed()
			.setColor('yellow')
			.setTitle('⚠️ warning!')
			.setDescription(this.client.utils.cleanContent(content.content) || 'idk what thing warned you sorry :(')
			.setTimestamp();

		content.content = '';

		if (hidden === undefined || hidden) {
			return this.createMessage({
				embeds: [embed.toJSON()],
				flags: 64,
				...content,
			});
		} else {
			return this.createMessage({
				embeds: [embed.toJSON()],
				files: content.files,
				...content,
			});
		}
	}
}
