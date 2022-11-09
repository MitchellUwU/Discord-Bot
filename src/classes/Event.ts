import { ClientEvents } from 'oceanic.js';
import { EventListener } from '../types/additional';

export default class Event<T extends keyof ClientEvents = keyof ClientEvents> {
	name: T;
	type: 'once' | 'on';
	listener: EventListener;
	constructor(name: T, once: boolean, listener: EventListener) {
		this.name = name;
		this.type = once ? 'once' : 'on';
		this.listener = listener;
	}
}
