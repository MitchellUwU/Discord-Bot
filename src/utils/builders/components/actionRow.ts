import { ActionRowBase, Component } from 'oceanic.js';

export default class ActionRowBuilder {
	private json: ActionRowBase;

	public constructor() {
		this.json = {} as ActionRowBase;
		this.json.type = 1;
	}

	public addComponent(options: Component): this {
		this.json.components = [...(this.json.components ?? []), options];
		return this;
	}

	public addComponents(components:  Component[]): this {
		components.forEach((arg: any) => this.addComponent(arg));
		return this;
	}

	public clear(): this {
		this.json.components = [];
		return this;
	}

	public toJSON(): any {
		return this.json;
	}
}
