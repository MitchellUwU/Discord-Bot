import BotClient from '../client';
import * as Lib from 'oceanic.js';

export interface EventOptions {
	name: string;
	once: boolean;
	type: string;
}

export default class EventInterface<K extends keyof Lib.ClientEvents = keyof Lib.ClientEvents> {
	private client: BotClient;
	public data: EventOptions = {} as EventOptions;

	public constructor(client: BotClient) {
		this.client = client;
	}

	public async execute(
		client: BotClient,
		...args: Lib.ClientEvents[K]
	): Promise<void | Lib.Message<Lib.TextChannel>> {
		this.client.utils.logger({ title: this.data.name, content: 'this works!', type: 1 });
	}
}
