import BotClient from '../client';
import * as Lib from 'oceanic.js';
import { EventOptions } from '../types/options';

export default class Event<K extends keyof Lib.ClientEvents = keyof Lib.ClientEvents> {
	private client: BotClient;
	public data: EventOptions = {} as EventOptions;

	public constructor(client: BotClient) {
		this.client = client;
	}

	public async execute(
		client: BotClient,
		...args: Lib.ClientEvents[K]
	): Promise<void | Lib.Message<Lib.AnyGuildTextChannel>> {
		this.client.utils.logger({ title: this.data.name, content: 'this works!', type: 1 });
	}
}
