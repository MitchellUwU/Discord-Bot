import type { ApplicationCommandOptionsChoice, LocaleMap } from 'oceanic.js';

export default class ChoiceBuilder {
	name: string;
	nameLocalizations?: LocaleMap;
	value: string | number;
	constructor(name: string, value: string | number, locale?: LocaleMap) {
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
