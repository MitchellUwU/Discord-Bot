import { BotConfig } from '../types/options';
import Utils from './Utils';
import Database from './Database';
import * as Lib from 'oceanic.js';
import Handler from './Handler';

/**
 * The main client.
 * @extends Lib.Client from oceanic.js library.
 */

export default class BotClient extends Lib.Client {
	readonly config: BotConfig;
	onMaintenance: boolean;
	handler: Handler;
	utils: Utils;
	db: Database;
	constructor(options: BotConfig) {
		super(options.clientOptions);

		this.onMaintenance = false;
		this.config = options;
		this.handler = new Handler(this);
		this.utils = new Utils(this);
		this.db = new Database(this);
	}

	/**
	 * Load handlers and connect the client.
	 * @returns Promise<void>
	 */

	async run(): Promise<void> {
		this.once('ready', () => this.handler.handleChatInputCommands().then(() => this.handler.syncCommands()));
		this.handler.handleEvents();

		await this.connect();
		this.editStatus(this.config.statusOptions.type as Lib.SendStatuses, this.config.statusOptions.activities);
	}

	/**
	 * Disconnect and shutdown the client.
	 * @returns void
	 */

	shutdown(): void {
		this.handler.reset();
		this.removeAllListeners();
		this.disconnect(false);

		process.exit();
	}
}
