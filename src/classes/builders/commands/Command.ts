import { ApplicationCommandBuilder } from '@oceanicjs/builders';
import type { ApplicationCommandOptions, ApplicationCommandTypes } from 'oceanic.js';

export default class CommandBuilder extends ApplicationCommandBuilder {
	constructor(type: ApplicationCommandTypes, name: string) {
		super(type, name);
	}

	addOptions(options: ApplicationCommandOptions[]): this {
		options.forEach((option) => this.addOption(option));
		return this;
	}
}
