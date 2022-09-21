import BotClient from '../client';
import { Builders } from './builders';
import Lib from 'oceanic.js';

// Wrapper for interaction (which is also a wrapper of raw interaction) to make things easier (i don't want to use Object.defineProperty, it makes my life hell).

export default class InteractionWrapper {
	private client: BotClient; // [INTERNAL] The main client.
	public raw: Lib.CommandInteraction<Lib.TextChannel>; // Unmodified interaction value.
	public options: Lib.InteractionOptionsWrapper; // Alias for interaction.raw.data.options
	public channel: Lib.TextChannel; // Alias for interaction.raw.channel
	public guild: Lib.Guild; // Alias for interaction.raw.guild
	public guildID: string; // Alias for interaction.raw.guildID
	public member: Lib.Member; // Alias for interaction.raw.member
	public user: Lib.User; // Alias for interaction.raw.user

	/**
	 * Interaction Wrapper constructor.
	 * @param client The main client.
	 * @param interaction Unmodified interaction value.
	 */

	public constructor(client: BotClient, interaction: Lib.CommandInteraction<Lib.TextChannel>) {
		this.client = client;
		this.raw = interaction;
		this.options = interaction.data.options;
		this.channel = interaction.channel;
		this.guild = interaction.guild;
		this.guildID = interaction.guildID;
		this.member = interaction.member;
		this.user = interaction.user;
	}

	/**
	 * Remove any token from content.
	 * @param content Any content.
	 * @returns string
	 */

	public cleanContent(content: any): string {
		let cleaned: string;

		cleaned = content?.replaceAll(this.client.config.clientOptions.auth, 'ClientToken');
		cleaned = content?.replaceAll(this.client.config.db.password, 'DatabaseToken');

		return cleaned;
	}

	/**
	 * [INTERNAL] Do nothing. (used for solving types error)
	 * @returns void
	 */

	private doNothing(): void {}

	/**
	 * Get all roles in a member.
	 * @param user Guild member.
	 * @returns any
	 */

	public getRoles(user: Lib.Member): any {
		return user.roles.map((roleID: string) => user.guild.roles.get(roleID));
	}

	/**
	 * Get member highest role.
	 * @param user Anything.
	 * @returns Lib.Role
	 */

	public getHighestRole(user: any): Lib.Role {
		return this.getRoles(user).reduce((prev: Lib.Role, role: Lib.Role) =>
			!prev || role.position >= prev.position ? role : prev
		);
	}

	/**
	 * Get member in a guild.
	 * @param id User ID of the member.
	 * @returns Promise<Lib.Member>
	 */

	public async getMember(id: string): Promise<Lib.Member> {
		return this.client.utils.getMember(this.raw.guildID, id);
	}

	/**
	 * Get user.
	 * @param id User ID of the user.
	 * @returns Promise<Lib.User>
	 */

	public async getUser(id: string): Promise<Lib.User> {
		return this.client.utils.getUser(id);
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

	public async createMessage(content: Lib.InteractionContent): Promise<void> {
		content.content = this.cleanContent(content.content);
		if (this.raw.acknowledged) {
			/**
			 * since createFollowup return a Message and i don't want that
			 * so i just make it do nothing so it return void (this could be a very bad idea in future so)
			 * [TODO] make this return a Message and properly solve types error
			 */
			this.raw.createFollowup(content);
			return this.doNothing();
		} else {
			return this.raw.createMessage(content);
		}
	}

	/**
	 * Send error respond to interaction.
	 * @param content Content of interaction.
	 * @returns Promise<void>
	 */

	public async createError(content: Lib.InteractionContent, hidden?: boolean): Promise<void> {
		const embed = new Builders.Embed()
			.setColor('red')
			.setTitle('❌ error!')
			.setDescription(this.cleanContent(content.content) || 'idk what went wrong sorry :(')
			.setTimestamp();

		if (this.raw.acknowledged) {
			if (hidden === undefined || hidden) {
				this.raw.createFollowup({
					embeds: [embed.toJSON()],
					flags: 64,
					files: content.files,
				});
				return this.doNothing();
			} else {
				this.raw.createFollowup({
					embeds: [embed.toJSON()],
					files: content.files,
				});
				return this.doNothing();
			}
		} else {
			if (hidden === undefined || hidden) {
				return this.raw.createMessage({
					embeds: [embed.toJSON()],
					flags: 64,
					files: content.files,
				});
			} else {
				return this.raw.createMessage({
					embeds: [embed.toJSON()],
					files: content.files,
				});
			}
		}
	}

	/**
	 * Send success respond to interaction.
	 * @param content Content of interaction.
	 * @returns Promise<void>
	 */

	public async createSuccess(content: Lib.InteractionContent, hidden?: boolean): Promise<void> {
		const embed = new Builders.Embed()
			.setColor('green')
			.setTitle('✅ success!')
			.setDescription(this.cleanContent(content.content) || 'idk what thing successfully been done sorry :(')
			.setTimestamp();

		if (this.raw.acknowledged) {
			if (hidden === undefined || hidden) {
				this.raw.createFollowup({
					embeds: [embed.toJSON()],
					flags: 64,
					files: content.files,
				});
				return this.doNothing();
			} else {
				this.raw.createFollowup({
					embeds: [embed.toJSON()],
					files: content.files,
				});
				return this.doNothing();
			}
		} else {
			if (hidden === undefined || hidden) {
				return this.raw.createMessage({
					embeds: [embed.toJSON()],
					flags: 64,
					files: content.files,
				});
			} else {
				return this.raw.createMessage({
					embeds: [embed.toJSON()],
					files: content.files,
				});
			}
		}
	}

	/**
	 * Send warning respond to interaction.
	 * @param content Content of interaction.
	 * @returns Promise<void>
	 */

	public async createWarn(content: Lib.InteractionContent, hidden?: boolean): Promise<void> {
		const embed = new Builders.Embed()
			.setColor('yellow')
			.setTitle('⚠️ warning!')
			.setDescription(this.cleanContent(content.content) || 'idk what thing warned you sorry :(')
			.setTimestamp();

		if (this.raw.acknowledged) {
			if (hidden === undefined || hidden) {
				this.raw.createFollowup({
					embeds: [embed.toJSON()],
					flags: 64,
					files: content.files,
				});
				return this.doNothing();
			} else {
				this.raw.createFollowup({
					embeds: [embed.toJSON()],
					files: content.files,
				});
				return this.doNothing();
			}
		} else {
			if (hidden === undefined || hidden) {
				return this.raw.createMessage({
					embeds: [embed.toJSON()],
					flags: 64,
					files: content.files,
				});
			} else {
				return this.raw.createMessage({
					embeds: [embed.toJSON()],
					files: content.files,
				});
			}
		}
	}
}
