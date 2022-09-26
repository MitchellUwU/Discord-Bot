import BotClient from '../client';
import { Builders } from '../utils/builders';

export interface EventOptions {
	name: string;
	once: boolean;
	type: string;
}

export default class EventInterface {
	private client: BotClient;
	public data: EventOptions = new Builders.Event('placeholder', true).toJSON();

	public constructor(client: BotClient) {
		this.client = client;
	}

	public async execute(client: BotClient, ...args: any): Promise<void> {
		this.client.utils.logger({ title: this.data.name, content: 'this works!', type: 1 });
	}
}
