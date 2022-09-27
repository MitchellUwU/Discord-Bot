import { ActionRowBase, ModalActionRow, ModalData } from 'oceanic.js';

export default class ModalBuilder {
	private json: ModalData;

	public constructor(customID: string, title: string) {
		this.json = {} as ModalData;
		this.json.customID = customID;
		this.json.title = title;
	}

	public setTitle(content: string): this {
		this.json.title = content;
		return this;
	}

	public setCustomID(id: string): this {
		this.json.customID = id;
		return this;
	}

	public addComponent(options: ModalActionRow): this {
		this.json.components = [...(this.json.components ?? []), options];
		return this;
	}

	public addComponents(components: ModalActionRow[]): this {
		components.forEach((arg: any) => this.addComponent(arg));
		return this;
	}

	public toJSON(): ModalData {
		return this.json;
	}
}
