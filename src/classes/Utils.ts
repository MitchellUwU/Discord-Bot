import type BotClient from './Client';
import type * as Lib from 'oceanic.js';
import type { LoggerOptions } from '../types/options';
import * as fs from 'fs/promises';
import path from 'path';

export default class Utils {
	private client: BotClient;
	constructor(client: BotClient) {
		this.client = client;
	}

	/**
	 * Recursive file loader.
	 * @param dir Directory to load.
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
	 */

	getRoles(user: Lib.Member) {
		return user.roles.map((roleID: string) => {
			const role = user.guild.roles.get(roleID);
			if (role === undefined) throw new Error(`${roleID} is not a valid role`);
			return role;
		});
	}

	/**
	 * Get member highest role.
	 * @param user Guild member.
	 * @returns Lib.Role
	 */

	getHighestRole(user: Lib.Member) {
		return this.getRoles(user).reduce((prev: Lib.Role, role: Lib.Role) =>
			!prev || role.position >= prev.position ? role : prev
		);
	}

	/**
	 * Get guild.
	 * @param guildID ID of the guild.
	 */

	async getGuild(guildID: string) {
		return this.client.guilds.get(guildID) || this.client.rest.guilds.get(guildID);
	}

	/**
	 * Get member in a guild.
	 * @param guildID ID of the guild.
	 * @param userID User ID of the member.
	 */

	async getMember(guildID: string, userID: string) {
		const guild = await this.getGuild(guildID);
		return guild.members.get(userID) || this.client.rest.guilds.getMember(guildID, userID);
	}

	/**
	 * Get user.
	 * @param id User ID of the user.
	 */

	async getUser(id: string) {
		return this.client.users.get(id) || this.client.rest.users.get(id);
	}

	/**
	 * Get current date.
	 */

	get getDate() {
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
	 * Get json content.
	 * @param body JSON. (don't ask why the type below is string, typescript accept it for some reason)
	 */

	async getJSONContent(body: string) {
		let parsedBody = '';

		for await (const data of body) {
			parsedBody += data.toString();
		}

		return JSON.parse(parsedBody);
	}

	/**
	 * The main logger.
	 * 
	 * 1 = Info.
	 * 2 = Error.
	 * 3 = Warn.
	 * 4 = Debug.
	 * @param options Logger Configuration.
	 */

	logger(options: LoggerOptions) {
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
	 */

	trim(str: string, max: number) {
		return str.length > max ? `${str.slice(0, max - 3)}...` : str;
	}
}
