import { TextInput as TextInputBase } from 'oceanic.js';

export default class TextInputBuilder {
	private json: TextInputBase;

	public constructor(style: number, customID: string, label: string) {
		this.json = {} as TextInputBase;
		this.json.type = 4;
		this.json.style = style;
		this.json.customID = customID;
		this.json.label = label;
	}

	public setStyle(number: number): this {
		this.json.style = number;
		return this;
	}

	public setLabel(content: string): this {
		this.json.label = content;
		return this;
	}

	public setDefaultValue(content: string): this {
		this.json.value = content;
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

	public setMaxLength(number: number): this {
		this.json.maxLength = number;
		return this;
	}

	public setMinLength(number: number): this {
		this.json.minLength = number;
		return this;
	}

	public setRequired(required: boolean): this {
		this.json.required = required;
		return this;
	}

	public toJSON(): TextInputBase {
		return this.json;
	}
}
