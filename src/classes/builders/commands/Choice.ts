import { ApplicationCommandOptionsChoice } from 'oceanic.js';

export default class ChoiceBuilder {
	name: string;
	nameLocalizations?: Record<string, string>;
	value: string | number;
	constructor(name: string, value: string | number, locale?: Record<string, string>) {
		this.name = name;
		this.nameLocalizations = locale;
		this.value = value;
	}

	toJSON(): ApplicationCommandOptionsChoice {
		return {
			name: this.name,
			nameLocalizations: this.nameLocalizations,
			value: this.value,
		};
	}
}
