import { ApplicationCommandOptions, ChannelTypes } from 'oceanic.js';

export default class OptionBuilder {
	private json: any;

	constructor(type: number, name: string) {
		this.json = {};
		this.json.type = type;
		this.json.name = name;
	}

	public setNameLocale(map: Record<string, string>): this {
		this.json.nameLocalizations = map;
		return this;
	}

	public setDescription(content: string): this {
		this.json.description = content;
		return this;
	}

	public setDescriptionLocale(map: Record<string, string>): this {
		this.json.descriptionLocalizations = map;
		return this;
	}

	public addOption(options: ApplicationCommandOptions): this {
		this.json.options = [...(this.json.options ?? []), options];
		return this;
	}

	public addOptions(options: ApplicationCommandOptions[]): this {
		options.forEach((option) => this.addOption(option));
		return this;
	}

	public setRequired(required: boolean): this {
		this.json.required = required;
		return this;
	}

	public addChoice(choices: any): this {
		this.json.choices = [...(this.json.choices ?? []), choices];
		return this;
	}

	public addChoices(choices: any[]): this {
		choices.forEach((choice) => this.addChoice(choice));
		return this;
	}

	public setAutoComplete(autocomplete: boolean): this {
		this.json.autocomplete = autocomplete;
		return this;
	}

	public setChannelTypes(types: ChannelTypes[]): this {
		this.json.channel_types = types;
		return this;
	}

	public setMaxValue(number: number): this {
		this.json.max_value = number;
		return this;
	}

	public setMinValue(number: number): this {
		this.json.min_value = number;
		return this;
	}

	public setMaxLength(number: number): this {
		this.json.max_length = number;
		return this;
	}

	public setMinLength(number: number): this {
		this.json.min_length = number;
		return this;
	}

	public toJSON(): ApplicationCommandOptions {
		return this.json;
	}
}
