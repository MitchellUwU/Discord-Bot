import { ApplicationCommandOptionsChoice, Locale } from 'oceanic.js';

export default class ChoiceBuilder {
	name: string;
	nameLocalizations?: Record<Locale, string>;
	value: string | number;
	constructor(name: string, value: string | number, locale?: Record<Locale, string>) {
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
