import { ApplicationCommandOptionsChoice } from 'oceanic.js';

export default class ChoiceBuilder {
	private json: any;

	constructor(name: string, value: string | number) {
		this.json = {};
		this.json.name = name;
		this.json.value = value;
	}

	public setNameLocale(map: Record<string, string>): this {
		this.json.nameLocalizations = map;
		return this;
	}

	public toJSON(): ApplicationCommandOptionsChoice {
		return this.json;
	}
}
