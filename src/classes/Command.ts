import BotClient from './Client';
import { CreateApplicationCommandOptions } from 'oceanic.js';
import InteractionWrapper from './InteractionWrapper';
import { ExecuteReturnType } from '../types/additional';

export default class Command {
	private client: BotClient;
	data: CreateApplicationCommandOptions = {} as CreateApplicationCommandOptions;

	constructor(client: BotClient) {
		this.client = client;
	}

	async execute(client: BotClient, interaction: InteractionWrapper): ExecuteReturnType {
		this.client.utils.logger({ title: this.data.name, content: 'this works!', type: 1 });
	}
}
