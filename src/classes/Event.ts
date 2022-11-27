import type { ClientEvents } from 'oceanic.js';
import type BotClient from './Client';

export default class Event<T extends keyof ClientEvents = keyof ClientEvents> {
	name: T;
	type: 'once' | 'on';
	listener: (client: BotClient, ...args: ClientEvents[T]) => void;
	constructor(name: T, once: boolean, listener: (client: BotClient, ...args: ClientEvents[T]) => void) {
		this.name = name;
		this.type = once ? 'once' : 'on';
		this.listener = listener;
	}
}
