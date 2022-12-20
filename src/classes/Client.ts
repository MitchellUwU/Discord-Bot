import Utils from './Utils';
import { Client, ClientOptions } from 'oceanic.js';
import Handler from './Handler';

export default class BotClient extends Client {
	handler: Handler;
	utils: Utils;
	constructor(options: ClientOptions) {
		super(options);

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
