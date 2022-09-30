import BotUtils from './utils/botUtils';
import { Collectors } from './utils/interactionCollector';
import Command from './interfaces/command';
import Database from './utils/db';
import Event from './interfaces/event';
import fs from 'fs/promises';
import * as Lib from 'oceanic.js';
import path from 'path';
import { PoolConfig } from 'pg';

// Client configuration interface.

export interface BotConfig {
	answers: {
		repliesTemplate: string[];
		answers: string[];
		pronouns: string[];
		faces: string[];
	};
	ascii?: string[];
	clientOptions: Lib.ClientOptions;
	blockedGuilds?: string[];
	blockedUsers?: string[];
	db: PoolConfig;
	devMode: boolean;
	devIDs: string[];
	disableDebug?: boolean;
	guildID?: string;
	requiredPermission: number;
	statusOptions: {
		type: string;
		activities: Lib.BotActivity[];
	};
}

/**
 * The main client.
 * @extends Lib.Client from oceanic.js library.
 */

export default class BotClient extends Lib.Client {
	public eventListeners: Map<string, Event> = new Map(); // Collection of event listeners.
	public interactions: Map<string, Command> = new Map(); // Collection of commands.

	private commandList: Lib.CreateApplicationCommandOptions[] = []; // [INTERNAL] Array of commands.
	public collectors: Collectors = new Collectors(); // Collector manager.
	public onMaintenance: boolean = false; // Value telling client maintenance state.
	public readonly config: BotConfig; // [READONLY] Configuration specified in constructor.
	public utils: BotUtils = new BotUtils(this); // Utility for the client.
	public db: Database = new Database(this); // Main database (PostgreSQL) manager.

	/**
	 * Client constructor.
	 * @param options Client configuration.
	 */

	public constructor(options: BotConfig) {
		super(options.clientOptions);
		this.config = options;
	}

	/**
	 * [INTERNAL] Recursive file loader.
	 * @param dir Directory to load.
	 * @returns AsyncGenerator<string, void, void>
	 */

	private async *loadFiles(dir: string): AsyncGenerator<string, void, void> {
		const files: string[] = await fs.readdir(dir);
		for await (const file of files) {
			const filePath: string = path.join(dir, file);
			const fileIsDir: boolean = (await fs.stat(filePath)).isDirectory();
			if (fileIsDir) {
				yield* this.loadFiles(filePath);
			} else {
				yield filePath;
			}
		}
	}

	/**
	 * [INTERNAL] Load and Register commands.
	 * @returns Promise<void>
	 */

	private async loadInteractions(): Promise<void> {
		const files: AsyncGenerator<string, void, void> = this.loadFiles(`${__dirname}/interactions`);
		for await (const file of files) {
			const Command = (await import(file)).default;
			const cmd: typeof Command = new Command(this);
			this.utils.logger({ title: 'InteractionsHandler', content: `Loaded ${cmd.data.name}!`, type: 1 });
			this.interactions.set(cmd.data.name, cmd);
			try {
				if (this.config.devMode && this.config.guildID) {
					this.application.createGuildCommand(this.config.guildID, cmd.data);
					this.commandList.push(cmd.data);
					this.utils.logger({
						title: 'InteractionsHandler',
						content: `Registered ${cmd.data.name}! (Guild)`,
						type: 1,
					});
				} else {
					this.application.createGlobalCommand(cmd.data);
					this.commandList.push(cmd.data);
					this.utils.logger({
						title: 'InteractionsHandler',
						content: `Registered ${cmd.data.name}! (Global)`,
						type: 1,
					});
				}
			} catch (error: any) {
				this.utils.logger({
					title: 'InteractionsHandler',
					content: `Cannot register commands due to: ${error.stack}`,
					type: 2,
				});
			}
		}
	}

	/**
	 * [INTERNAL] Load event listeners.
	 * @returns Promise<void>
	 */

	private async loadListeners(): Promise<void> {
		const files: AsyncGenerator<string, void, void> = this.loadFiles(`${__dirname}/listeners`);
		for await (const file of files) {
			const Listener = (await import(file)).default;
			const event: typeof Listener = new Listener(this);
			this.utils.logger({ title: 'EventListenersHandler', content: `Loaded ${event.data.name}!`, type: 1 });
			this.eventListeners.set(event.data.name, event);
			event.client[event.data.type](event.data.name, (...args: any) => event.execute(this, ...args));
		}
	}

	/**
	 * Start and connect the client.
	 * @returns Promise<void>
	 */

	public async start(): Promise<void> {
		this.once('ready', () => this.loadInteractions().then(() => this.syncCommands()));
		this.loadListeners();

		await this.connect();
		this.editStatus(this.config.statusOptions.type as Lib.SendStatuses, this.config.statusOptions.activities);
	}

	/**
	 * Disconnect and shutdown the client.
	 * @returns void
	 */

	public shutdown(): void {
		this.ready = false;
		this.commandList = [];
		this.interactions.clear();
		this.eventListeners.clear();
		this.removeAllListeners();
		this.shards.forEach((shard: Lib.Shard) => shard.disconnect());

		process.exit();
	}

	/**
	 * [INTERNAL] Sync application commands.
	 * @returns void
	 */
	
	private syncCommands(): void {
		try {
			if (this.config.devMode && this.config.guildID) {
				this.application.bulkEditGuildCommands(this.config.guildID, this.commandList);
				this.utils.logger({
					title: 'InteractionsHandler',
					content: 'Successfully synced all application commands! (Guild)',
					type: 1,
				});
			} else {
				this.application.bulkEditGlobalCommands(this.commandList);
				this.utils.logger({
					title: 'InteractionsHandler',
					content: 'Successfully synced all application commands! (Global)',
					type: 1,
				});
			}
		} catch (error: any) {
			this.utils.logger({
				title: 'InteractionsHandler',
				content: `Cannot sync application commands due to: ${error.stack}`,
				type: 2,
			});
		}
	}
}
