import BotClient from './Client';
import Builders from './Builders';
import * as Lib from 'oceanic.js';
import { AnyGuildInteractionNonAutoComplete } from '../types/additional';

// Wrapper for interaction (which is also a wrapper of raw interaction) to make things easier (i don't want to do monkey patch shit, it makes my life hell).

export default class InteractionWrapper {
	private client: BotClient; // [INTERNAL] The main client.
	public raw: AnyGuildInteractionNonAutoComplete; // Unmodified interaction value.
	public options: Lib.InteractionOptionsWrapper; // Alias for interaction.raw.data.options
	public channel: Lib.AnyGuildTextChannel; // Alias for interaction.raw.channel
	public guild: Lib.Guild; // Alias for interaction.raw.guild
	public guildID: string; // Alias for interaction.raw.guildID
	public member: Lib.Member; // Alias for interaction.raw.member
	public user: Lib.User; // Alias for interaction.raw.user

	/**
	 * Interaction Wrapper constructor.
	 * @param client The main client.
	 * @param interaction Unmodified interaction value.
	 */

	public constructor(client: BotClient, interaction: AnyGuildInteractionNonAutoComplete) {
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

	public async editOriginal(
		content: Lib.InteractionContent
	): Promise<void | Lib.Message<Lib.AnyGuildTextChannel>> {
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

	public async deferResponse(flag?: number): Promise<void> {
		return this.raw.defer(flag);
	}

	/**
	 * Send a respond to interaction.
	 * @param content Content of interaction.
	 * @returns Promise<void>
	 */

	public async createMessage(
		content: Lib.InteractionContent
	): Promise<void | Lib.Message<Lib.AnyGuildTextChannel>> {
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

	public async createError(
		content: Lib.InteractionContent,
		hidden?: boolean
	): Promise<void | Lib.Message<Lib.AnyGuildTextChannel>> {
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

	public async createSuccess(
		content: Lib.InteractionContent,
		hidden?: boolean
	): Promise<void | Lib.Message<Lib.AnyGuildTextChannel>> {
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

	public async createWarn(
		content: Lib.InteractionContent,
		hidden?: boolean
	): Promise<void | Lib.Message<Lib.AnyGuildTextChannel>> {
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
