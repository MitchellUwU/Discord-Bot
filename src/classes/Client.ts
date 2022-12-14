import type { BotConfig } from '../types/options';
import Utils from './Utils';
import { Client, SendStatuses } from 'oceanic.js';
import Handler from './Handler';

export default class BotClient extends Client {
	readonly config: BotConfig;
	handler: Handler;
	utils: Utils;
	constructor(options: BotConfig) {
		super(options.clientOptions);

		this.config = options;
		this.handler = new Handler(this);
		this.utils = new Utils(this);
	}

	/**
	 * Load handlers and connect the client.
	 */

	async run() {
		this.once('ready', async () => {
			await this.handler.handleChatInputCommands();
			await this.handler.handleMessageCommands();
			await this.handler.handleUserCommands();
			//await this.handler.handleComponents();
			this.handler.registerCommands();
		});

		this.handler.handleEvents();

		await this.connect();
		this.editStatus(this.config.statusOptions.type as SendStatuses, this.config.statusOptions.activities);
	}

	/**
	 * Disconnect and shutdown the client.
	 */

	shutdown() {
		this.handler.reset();
		this.disconnect(false);

		process.exit();
	}
}
