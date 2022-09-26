import { SelectMenu as SelectMenuBase, SelectOption } from 'oceanic.js';

export default class SelectMenuBuilder {
	private json: any;

	public constructor(customID: string) {
		this.json = {};
		this.json.type = 3;
		this.json.customID = customID;
	}

	public addOption(options: SelectOption): this {
		this.json.options = [...(this.json.options ?? []), options];
		return this;
	}

	public addOptions(components: SelectOption[]): this {
		components.forEach((arg: any) => this.addOption(arg));
		return this;
	}

	public setCustomID(id: string): this {
		this.json.customID = id;
		return this;
	}

	public setPlaceHolder(content: string): this {
		this.json.placeholder = content;
		return this;
	}

	public setMaxValues(number: number): this {
		this.json.max_values = number;
		return this;
	}

	public setMinValues(number: number): this {
		this.json.min_values = number;
		return this;
	}

	public setDisabled(disabled: boolean): this {
		this.json.disabled = disabled;
		return this;
	}

	public toJSON(): SelectMenuBase {
		return this.json;
	}
}
