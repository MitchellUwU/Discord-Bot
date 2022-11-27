import type {
	ApplicationCommandOptions,
	ApplicationCommandOptionsChoice,
	ApplicationCommandOptionTypes,
} from 'oceanic.js';
import { ApplicationCommandOptionBuilder } from '@oceanicjs/builders';

export default class OptionBuilder extends ApplicationCommandOptionBuilder {
	constructor(type: ApplicationCommandOptionTypes, name: string) {
		super(type, name);
	}

	addOptions(options: ApplicationCommandOptions[]): this {
		options.forEach((option) => this.addOption(option));
		return this;
	}

	addChoices(choices: ApplicationCommandOptionsChoice[]): this {
		choices.forEach((choice) => this.addChoice(choice.name, choice.value, choice.nameLocalizations));
		return this;
	}
}
