import BotClient from '../client';
import * as Lib from 'oceanic.js';
import { EventOptions } from '../types/options';
import { EventListener, ExecuteReturnType } from '../types/additional';

export default class Event<K extends keyof Lib.ClientEvents = keyof Lib.ClientEvents> {
	private client: BotClient;
	public listener: EventListener;
	public data: EventOptions = {} as EventOptions;

	public constructor(client: BotClient, listener: EventListener) {
		this.client = client;
		this.listener = listener;
	}

	public async execute(client: BotClient, ...args: Lib.ClientEvents[K]): ExecuteReturnType {
		this.client.utils.logger({ title: this.data.name, content: 'this works!', type: 1 });
	}
}
