import type BotClient from './Client';
import type { AnyGuildTextChannel, CommandInteraction, CreateApplicationCommandOptions } from 'oceanic.js';

export default class Command {
	private client: BotClient;
	data: CreateApplicationCommandOptions = {} as CreateApplicationCommandOptions;

	constructor(client: BotClient) {
		this.client = client;
	}

	async execute(_client: BotClient, _interaction: CommandInteraction<AnyGuildTextChannel>): Promise<unknown> {
		return this.client.utils.logger({ title: this.data.name, content: 'this works!', type: 1 });
	}
}
