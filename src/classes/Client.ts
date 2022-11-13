import { BotConfig } from '../types/options';
import Utils from './Utils';
import Database from './Database';
import { Client, SendStatuses } from 'oceanic.js';
import Handler from './Handler';

export default class BotClient extends Client {
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
	 */

	async run() {
		this.once('ready', () => this.handler.handleChatInputCommands().then(() => this.handler.registerCommands()));
		this.handler.handleEvents();

		await this.connect();
		this.editStatus(this.config.statusOptions.type as SendStatuses, this.config.statusOptions.activities);
	}

	/**
	 * Disconnect and shutdown the client.
	 */

	shutdown() {
		this.handler.reset();
		this.removeAllListeners();
		this.disconnect(false);

		process.exit();
	}
}
