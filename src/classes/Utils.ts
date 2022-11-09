import BotClient from './Client';
import * as Lib from 'oceanic.js';
import { LoggerOptions } from '../types/options';
import * as fs from 'fs/promises';
import path from 'path';
import { Collectors } from './Collectors';

export default class Utils {
	private client: BotClient;
	collectors: Collectors;
	constructor(client: BotClient) {
		this.client = client;
		this.collectors = new Collectors();
	}

	/**
	 * Remove token from content.
	 * @param content Any content.
	 * @returns string
	 */

	cleanContent(content: any): string {
		let cleaned: string;

		cleaned = content?.replaceAll(this.client.config.clientOptions.auth, 'ClientToken');
		cleaned = content?.replaceAll(this.client.config.db.password, 'DatabaseToken');

		return cleaned;
	}

	/**
	 * Recursive file loader.
	 * @param dir Directory to load.
	 * @returns AsyncGenerator<string, void, void>
	 */

	async *loadFiles(dir: string): AsyncGenerator<string, void, void> {
		const files = await fs.readdir(dir);
		for await (const file of files) {
			const filePath = path.join(dir, file);
			const fileIsDir = (await fs.stat(filePath)).isDirectory();
			if (fileIsDir) {
				yield* this.loadFiles(filePath);
			} else {
				yield filePath;
			}
		}
	}

	/**
	 * Get all member roles.
	 * @param user Guild member.
	 * @returns any
	 */

	getRoles(user: Lib.Member): any {
		return user.roles.map((roleID: string) => user.guild.roles.get(roleID));
	}

	/**
	 * Get member highest role.
	 * @param user Guild member.
	 * @returns Lib.Role
	 */

	getHighestRole(user: Lib.Member): Lib.Role {
		return this.getRoles(user).reduce((prev: Lib.Role, role: Lib.Role) =>
			!prev || role.position >= prev.position ? role : prev
		);
	}

	/**
	 * Get guild.
	 * @param guildID ID of the guild.
	 * @returns Promise<Lib.Guild>
	 */

	async getGuild(guildID: string): Promise<Lib.Guild> {
		return this.client.guilds.get(guildID) || (await this.client.rest.guilds.get(guildID));
	}

	/**
	 * Get member in a guild.
	 * @param guildID ID of the guild.
	 * @param userID User ID of the member.
	 * @returns Promise<Lib.Member>
	 */

	async getMember(guildID: string, userID: string): Promise<Lib.Member> {
		const guild = await this.getGuild(guildID);
		return guild.members.get(userID) || (await this.client.rest.guilds.getMember(guildID, userID));
	}

	/**
	 * Get user.
	 * @param id User ID of the user.
	 * @returns Promise<Lib.User>
	 */

	async getUser(id: string): Promise<Lib.User> {
		return this.client.users.get(id) || (await this.client.rest.users.get(id));
	}

	/**
	 * Get current date.
	 * @returns string
	 */

	get getDate(): string {
		const currentTime = new Date();
		const date = ('0' + currentTime.getDate()).slice(-2);
		const month = ('0' + (currentTime.getMonth() + 1)).slice(-2);
		const year = currentTime.getFullYear();
		const hours = ('0' + currentTime.getHours()).slice(-2);
		const minutes = ('0' + currentTime.getMinutes()).slice(-2);
		const seconds = ('0' + currentTime.getSeconds()).slice(-2);
		return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
	}

	/**
	 * Get json connect.
	 * @param body Anything.
	 * @returns Promise<any>
	 */

	async getJSONContent(body: any): Promise<any> {
		let parsedBody = '';

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

	logger(options: LoggerOptions): void {
		const title = options.title;
		const content = options.content;

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

	/**
	 * Trim amount of characters.
	 * @param str Message that you want to trim.
	 * @param max Amount of characters that you want to trim to.
	 * @returns string
	 */

	trim(str: string, max: number): string {
		return str.length > max ? `${str.slice(0, max - 3)}...` : str;
	}
}
