import * as Lib from 'oceanic.js';
import { EventOptions } from '../../interfaces/event';

export default class EventBuilder {
	private json: EventOptions;

	public constructor(name: keyof Lib.ClientEvents, once: boolean) {
		this.json = {} as EventOptions;
		this.json.name = name;
		this.json.once = once;
		this.json.type = once ? 'once' : 'on';
	}

	public toJSON(): EventOptions {
		return this.json;
	}
}
