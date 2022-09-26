import { LocalizationMap } from 'discord-api-types/v10';
import { ApplicationCommandOptions, CreateApplicationCommandOptions } from 'oceanic.js';

export default class CommandBuilder {
	private json: any;

	constructor(type: number, name: string) {
		this.json = {};
		this.json.type = type;
		this.json.name = name;
	}

	public setNameLocale(map: LocalizationMap): this {
		this.json.nameLocalizations = map;
		return this;
	}

	public setDescription(content: string): this {
		this.json.description = content;
		return this;
	}

	public setDescriptionLocale(map: LocalizationMap): this {
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

	public setDefaultMemberPermission(permission: string): this {
		this.json.defaultMemberPermissions = permission;
		return this;
	}

	public setDMPermission(permission: boolean): this {
		this.json.dmPermission = permission;
		return this;
	}

	public toJSON(): CreateApplicationCommandOptions {
		return this.json;
	}
}
