import {
	ApplicationCommandTypes,
	CreateApplicationCommandOptions,
	CreateChatInputApplicationCommandOptions,
	CreateMessageApplicationCommandOptions,
	CreateUserApplicationCommandOptions,
} from 'oceanic.js';
import type BotClient from './Client';
import type Command from './Command';
import type Component from './Component';
import config from '../../config.json';
import type Event from './Event';

export default class Handler {
	private client: BotClient;
	events: Map<string, Event>;
	chatInputCommands: Map<string, Command>;
	messageCommands: Map<string, Command>;
	userCommands: Map<string, Command>;
	components: Map<string, Component>;
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
		this.client.removeAllListeners();

		this.events.clear();
		this.chatInputCommands.clear();
		this.messageCommands.clear();
		this.userCommands.clear();
		this.components.clear();

		this.chatInputCommandList = [];
		this.messageCommandList = [];
		this.userCommandList = [];
	}

	getCommand(name: string, type: ApplicationCommandTypes) {
		if (type === ApplicationCommandTypes.CHAT_INPUT) return this.chatInputCommands.get(name);
		else if (type === ApplicationCommandTypes.MESSAGE) return this.messageCommands.get(name);
		else if (type === ApplicationCommandTypes.USER) return this.userCommands.get(name);
		else return this.chatInputCommands.get(name);
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
			const cmd = new Command(this.client);
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
			const cmd = new Command(this.client);
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
			const cmd = new Command(this.client);
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
			const cmpt = new Component(this.client);
			this.client.utils.logger({ title: 'ComponentsHandler', content: `Loaded ${cmpt.id}!`, type: 1 });
			this.components.set(cmpt.id, cmpt);
		}
	}

	registerCommands() {
		try {
			if (config.devMode && config.guildID) {
				this.client.application.bulkEditGuildCommands(config.guildID, this.commandList);
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
