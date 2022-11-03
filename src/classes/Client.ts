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
	public handler: Handler;
	public onMaintenance: boolean; // Value telling client maintenance state.
	public readonly config: BotConfig; // [READONLY] Configuration specified in constructor.
	public utils: Utils; // Utility for the client.
	public db: Database; // Main database (PostgreSQL) manager.

	/**
	 * Client constructor.
	 * @param options Client configuration.
	 */

	public constructor(options: BotConfig) {
		super(options.clientOptions);

		this.onMaintenance = false;
		this.config = options;
		this.handler = new Handler(this);
		this.utils = new Utils(this);
		this.db = new Database(this);
	}

	/**
	 * Start and connect the client.
	 * @returns Promise<void>
	 */

	public async run(): Promise<void> {
		this.once('ready', () => this.handler.handleChatInputCommands().then(() => this.handler.syncCommands()));
		this.handler.handleEvents();

		await this.connect();
		this.editStatus(this.config.statusOptions.type as Lib.SendStatuses, this.config.statusOptions.activities);
	}

	/**
	 * Disconnect and shutdown the client.
	 * @returns void
	 */

	public shutdown(): void {
		this.handler.reset();
		this.removeAllListeners();
		this.disconnect(false);

		process.exit();
	}
}
