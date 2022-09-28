import BotClient from '../client';
import * as Lib from 'oceanic.js';

// Logger configuration interface.

export interface LoggerOptions {
	title: string;
	content: unknown;
	type: number;
}

// Utility for the client.

export default class BotUtils {
	private client: BotClient; // [INTERNAL] The main client.

	/**
	 * Utility constructor.
	 * @param client The main client.
	 */

	public constructor(client: BotClient) {
		this.client = client;
	}

	/**
	 * Get guild.
	 * @param guildID ID of the guild.
	 * @returns Promise<Lib.Guild>
	 */

	public async getGuild(guildID: string): Promise<Lib.Guild> {
		return this.client.guilds.get(guildID) || (await this.client.rest.guilds.get(guildID));
	}

	/**
	 * Get member in a guild.
	 * @param guildID ID of the guild.
	 * @param userID User ID of the member.
	 * @returns Promise<Lib.Member>
	 */

	public async getMember(guildID: string, userID: string): Promise<Lib.Member> {
		const guild = await this.getGuild(guildID);
		return guild.members.get(userID) || (await this.client.rest.guilds.getMember(guildID, userID));
	}

	/**
	 * Get user.
	 * @param id User ID of the user.
	 * @returns Promise<Lib.User>
	 */

	public async getUser(id: string): Promise<Lib.User> {
		return this.client.users.get(id) || (await this.client.rest.users.get(id));
	}

	/**
	 * Get current date.
	 * @returns string
	 */

	public get getDate(): string {
		const currentTime: Date = new Date();
		const date: string = ('0' + currentTime.getDate()).slice(-2);
		const month: string = ('0' + (currentTime.getMonth() + 1)).slice(-2);
		const year: number = currentTime.getFullYear();
		const hours: string = ('0' + currentTime.getHours()).slice(-2);
		const minutes: string = ('0' + currentTime.getMinutes()).slice(-2);
		const seconds: string = ('0' + currentTime.getSeconds()).slice(-2);
		return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
	}

	/**
	 * Get json connect.
	 * @param body Anything.
	 * @returns Promise<any>
	 */

	public async getJSONContent(body: any): Promise<any> {
		let parsedBody: string = '';

		for await (const data of body) {
			parsedBody += data.toString();
		}

		return JSON.parse(parsedBody);
	}

	/**
	 * The main logger.
	 * @param options Logger Configuration.
	 * @returns void
	 */

	public logger(options: LoggerOptions): void {
		const title: string = options.title;
		const content: unknown = options.content;

		switch (options.type) {
			case 1: {
				console.log(` \x1b[2m${this.getDate}\x1b[0m | \x1b[32mINFORMATION\x1b[0m - ${title} | ${content}`);
				break;
			}
			case 2: {
				console.error(` \x1b[2m${this.getDate}\x1b[0m | \x1b[31mERROR\x1b[0m - ${title} | ${content}`);
				break;
			}
			case 3: {
				console.warn(` \x1b[2m${this.getDate}\x1b[0m | \x1b[33mWARNING\x1b[0m - ${title} | ${content}`);
				break;
			}
			case 4: {
				console.log(` \x1b[2m${this.getDate}\x1b[0m | \x1b[35mDEBUG\x1b[0m - ${title} | ${content}`);
				break;
			}
		}
	}
}
