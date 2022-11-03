import BotClient from './Client';
import { CreateApplicationCommandOptions } from 'oceanic.js';
import InteractionWrapper from './InteractionWrapper';
import { ExecuteReturnType } from '../types/additional';

export default class Command {
	private client: BotClient;
	public data: CreateApplicationCommandOptions = {} as CreateApplicationCommandOptions;

	public constructor(client: BotClient) {
		this.client = client;
	}

	public async execute(client: BotClient, interaction: InteractionWrapper): ExecuteReturnType {
		this.client.utils.logger({ title: this.data.name, content: 'this works!', type: 1 });
	}
}
