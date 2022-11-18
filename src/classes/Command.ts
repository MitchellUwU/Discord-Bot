import BotClient from './Client';
import { AnyGuildTextChannel, CommandInteraction, CreateApplicationCommandOptions } from 'oceanic.js';

export default class Command {
	private client: BotClient;
	data: CreateApplicationCommandOptions = {} as CreateApplicationCommandOptions;

	constructor(client: BotClient) {
		this.client = client;
	}

	async execute(client: BotClient, interaction: CommandInteraction<AnyGuildTextChannel>): Promise<unknown> {
		return this.client.utils.logger({ title: this.data.name, content: 'this works!', type: 1 });
	}
}
