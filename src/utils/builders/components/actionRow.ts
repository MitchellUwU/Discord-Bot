import { ActionRowBase } from 'oceanic.js';

export default class ActionRowBuilder<T> {
	private json: any;

	public constructor() {
		this.json = {};
		this.json.type = 1;
	}

	public addComponent(options: T): this {
		this.json.components = [...(this.json.components ?? []), options];
		return this;
	}

	public addComponents(components: T[]): this {
		components.forEach((arg: any) => this.addComponent(arg));
		return this;
	}

	public clear(): this {
		this.json.components = [];
		return this;
	}

	public toJSON(): ActionRowBase {
		return this.json;
	}
}
