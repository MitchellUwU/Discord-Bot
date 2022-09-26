import BotClient from '../client';
import { CreateApplicationCommandOptions } from 'oceanic.js';
import InteractionWrapper from '../utils/interactionWrapper';
import Lib from 'oceanic.js';

export default class CommandInterface {
	private client: BotClient;
	public data: CreateApplicationCommandOptions = {} as CreateApplicationCommandOptions;

	public constructor(client: BotClient) {
		this.client = client;
	}

	public async execute(
		client: BotClient,
		interaction: InteractionWrapper
	): Promise<void | Lib.Message<Lib.TextChannel>> {
		this.client.utils.logger({ title: this.data.name, content: 'this works!', type: 1 });
	}
}
