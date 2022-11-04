import { CreateChatInputApplicationCommandOptions, CreateMessageApplicationCommandOptions } from 'oceanic.js';
import BotClient from './Client';
import Command from './Command';
import Event from './Event';

export default class Handler {
	private client: BotClient;
	events: Map<string, Event>;
	chatInputCommands: Map<string, Command>;
	messageCommands: Map<string, Command>;
	components: Map<string, any>;
	chatInputCommandList: CreateChatInputApplicationCommandOptions[];
	messageCommandList: CreateMessageApplicationCommandOptions[];
	constructor(client: BotClient) {
		this.client = client;

		this.events = new Map();
		this.chatInputCommands = new Map();
		this.chatInputCommandList = [];
		this.messageCommands = new Map();
		this.messageCommandList = [];
		this.components = new Map();
	}

	reset(): void {
		this.events.clear();
		this.chatInputCommands.clear();
		this.messageCommands.clear();
		this.components.clear();

		this.chatInputCommandList = [];
		this.messageCommandList = [];
	}

	async handleEvents(): Promise<void> {
		const files = this.client.utils.loadFiles(`${__dirname}/../listeners`);
		for await (const file of files) {
			const event: Event = (await import(file)).default;
			this.client.utils.logger({
				title: 'EventListenersHandler',
				content: `Loaded ${event.name}!`,
				type: 1,
			});
			this.events.set(event.name, event);
			this.client[event.type](event.name, event.listener.bind(this, this.client));
		}
	}

	async handleChatInputCommands(): Promise<void> {
		const files = this.client.utils.loadFiles(`${__dirname}/../interactions/chatInput`);
		for await (const file of files) {
			const Command = (await import(file)).default;
			const cmd = new Command(this);
			this.client.utils.logger({
				title: 'ChatInputCommandsHandler',
				content: `Loaded ${cmd.data.name}!`,
				type: 1,
			});
			this.chatInputCommands.set(cmd.data.name, cmd);
			try {
				if (this.client.config.devMode && this.client.config.guildID) {
					await this.client.application.createGuildCommand(this.client.config.guildID, cmd.data);
					this.chatInputCommandList.push(cmd.data);
					this.client.utils.logger({
						title: 'ChatInputCommandsHandler',
						content: `Registered ${cmd.data.name}! (Guild)`,
						type: 1,
					});
				} else {
					await this.client.application.createGlobalCommand(cmd.data);
					this.chatInputCommandList.push(cmd.data);
					this.client.utils.logger({
						title: 'ChatInputCommandsHandler',
						content: `Registered ${cmd.data.name}! (Global)`,
						type: 1,
					});
				}
			} catch (error: any) {
				this.client.utils.logger({
					title: 'ChatInputCommandsHandler',
					content: `Cannot register commands due to: ${error.stack}`,
					type: 2,
				});
			}
		}
	}

	async handleMessageCommands(): Promise<void> {
		const files = this.client.utils.loadFiles(`${__dirname}/../interactions/message`);
		for await (const file of files) {
			const Command = (await import(file)).default;
			const cmd = new Command(this);
			this.client.utils.logger({
				title: 'MessageCommandsHandler',
				content: `Loaded ${cmd.data.name}!`,
				type: 1,
			});
			this.messageCommands.set(cmd.data.name, cmd);
			try {
				if (this.client.config.devMode && this.client.config.guildID) {
					await this.client.application.createGuildCommand(this.client.config.guildID, cmd.data);
					this.messageCommandList.push(cmd.data);
					this.client.utils.logger({
						title: 'MessageCommandsHandler',
						content: `Registered ${cmd.data.name}! (Guild)`,
						type: 1,
					});
				} else {
					await this.client.application.createGlobalCommand(cmd.data);
					this.messageCommandList.push(cmd.data);
					this.client.utils.logger({
						title: 'MessageCommandsHandler',
						content: `Registered ${cmd.data.name}! (Global)`,
						type: 1,
					});
				}
			} catch (error: any) {
				this.client.utils.logger({
					title: 'MessageCommandsHandler',
					content: `Cannot register commands due to: ${error.stack}`,
					type: 2,
				});
			}
		}
	}

	async handleComponents(): Promise<void> {
		const files = this.client.utils.loadFiles(`${__dirname}/../interactions/components`);
		for await (const file of files) {
			const Component = (await import(file)).default;
			const cmpt = new Component(this);
			this.client.utils.logger({ title: 'ComponentsHandler', content: `Loaded ${cmpt.data.name}!`, type: 1 });
			this.components.set(cmpt.data.name, cmpt);
		}
	}

	syncCommands(): void {
		try {
			if (this.client.config.devMode && this.client.config.guildID) {
				this.client.application.bulkEditGuildCommands(this.client.config.guildID, this.chatInputCommandList);
				this.client.utils.logger({
					title: 'ChatInputCommandsHandler',
					content: 'Successfully synced all application commands! (Guild)',
					type: 1,
				});
			} else {
				this.client.application.bulkEditGlobalCommands(this.chatInputCommandList);
				this.client.utils.logger({
					title: 'ChatInputCommandsHandler',
					content: 'Successfully synced all application commands! (Global)',
					type: 1,
				});
			}
		} catch (error: any) {
			this.client.utils.logger({
				title: 'ChatInputCommandsHandler',
				content: `Cannot sync application commands due to: ${error.stack}`,
				type: 2,
			});
		}
	}
}
