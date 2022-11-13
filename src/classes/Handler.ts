import {
	CreateApplicationCommandOptions,
	CreateChatInputApplicationCommandOptions,
	CreateMessageApplicationCommandOptions,
	CreateUserApplicationCommandOptions,
} from 'oceanic.js';
import BotClient from './Client';
import Command from './Command';
import Event from './Event';

export default class Handler {
	private client: BotClient;
	events: Map<string, Event>;
	chatInputCommands: Map<string, Command>;
	messageCommands: Map<string, Command>;
	userCommands: Map<string, Command>;
	components: Map<string, any>;
	commandList: CreateApplicationCommandOptions[];
	chatInputCommandList: CreateChatInputApplicationCommandOptions[];
	messageCommandList: CreateMessageApplicationCommandOptions[];
	userCommandList: CreateUserApplicationCommandOptions[];
	constructor(client: BotClient) {
		this.client = client;

		this.events = new Map();
		this.commandList = [];
		this.chatInputCommands = new Map();
		this.chatInputCommandList = [];
		this.messageCommands = new Map();
		this.messageCommandList = [];
		this.userCommands = new Map();
		this.userCommandList = [];
		this.components = new Map();
	}

	reset() {
		this.events.clear();
		this.chatInputCommands.clear();
		this.messageCommands.clear();
		this.components.clear();

		this.chatInputCommandList = [];
		this.messageCommandList = [];
	}

	async handleEvents() {
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

	async handleChatInputCommands() {
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
			this.chatInputCommandList.push(cmd.data);
			this.commandList.push(cmd.data);
		}
	}

	async handleMessageCommands() {
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
			this.messageCommandList.push(cmd.data);
			this.commandList.push(cmd.data);
		}
	}

	async handleUserCommands() {
		const files = this.client.utils.loadFiles(`${__dirname}/../interactions/user`);
		for await (const file of files) {
			const Command = (await import(file)).default;
			const cmd = new Command(this);
			this.client.utils.logger({
				title: 'UserCommandsHandler',
				content: `Loaded ${cmd.data.name}!`,
				type: 1,
			});
			this.userCommands.set(cmd.data.name, cmd);
			this.userCommandList.push(cmd.data);
			this.commandList.push(cmd.data);
		}
	}

	async handleComponents() {
		const files = this.client.utils.loadFiles(`${__dirname}/../interactions/components`);
		for await (const file of files) {
			const Component = (await import(file)).default;
			const cmpt = new Component(this);
			this.client.utils.logger({ title: 'ComponentsHandler', content: `Loaded ${cmpt.data.name}!`, type: 1 });
			this.components.set(cmpt.data.name, cmpt);
		}
	}

	registerCommands() {
		try {
			if (this.client.config.devMode && this.client.config.guildID) {
				this.client.application.bulkEditGuildCommands(this.client.config.guildID, this.commandList);
				this.client.utils.logger({
					title: 'ApplicationCommandsHandler',
					content: 'Successfully registered all application commands! (Guild)',
					type: 1,
				});
			} else {
				this.client.application.bulkEditGlobalCommands(this.commandList);
				this.client.utils.logger({
					title: 'ApplicationCommandsHandler',
					content: 'Successfully registered all application commands! (Global)',
					type: 1,
				});
			}
		} catch (error) {
			this.client.utils.logger({
				title: 'ApplicationCommandsHandler',
				content: `Cannot register application commands due to: ${error}`,
				type: 2,
			});
		}
	}
}
