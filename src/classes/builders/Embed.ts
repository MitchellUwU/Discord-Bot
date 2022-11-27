/**
 * I had to copy the entire embed builder code from @oceanic.js/builders, since addFields method just doesn't work when i extend it.
 *
 * Credit is below:
 *
 * Copyright (c) 2022 Donovan Daniels
 * View full license: https://github.com/OceanicJS/Builders/blob/master/LICENSE
 */

import {
	EmbedAuthorOptions,
	EmbedField,
	EmbedFooterOptions,
	EmbedImageOptions,
	EmbedOptions,
	RawEmbedOptions,
	Util,
} from 'oceanic.js';

export default class EmbedBuilder {
	private json: EmbedOptions = {};

	/**
	 * Create an embed builder instance (or multiple) from the provided json
	 * @param json - the embed json - accepts singular & array
	 * @param forceSingular - force a singular return when an array is supplied
	 */

	static loadFromJSON(json: EmbedOptions): EmbedBuilder;
	static loadFromJSON<T extends boolean = false>(
		json: Array<EmbedOptions>,
		forceSingular?: T
	): T extends true ? EmbedBuilder : Array<EmbedBuilder>;
	static loadFromJSON(
		json: EmbedOptions | Array<EmbedOptions>,
		forceSingular?: boolean
	): EmbedBuilder | Array<EmbedBuilder> | undefined {
		if (Array.isArray(json)) {
			const val = json.map((v) => EmbedBuilder.loadFromJSON(v));
			return forceSingular ? val[0] : val;
		} else {
			return new EmbedBuilder().load(json);
		}
	}

	/**
	 * Load json into this embed builder instance - use static loadFromJSON method
	 * @private
	 * @param {EmbedOptions} json - the json to load
	 * @returns {this}
	 */

	private load(json: EmbedOptions): this {
		this.json = json;
		return this;
	}

	/**
	 * Add a blank field to the embed (zero width spaces).
	 * @param inline If the field should be displayed inline.
	 */

	addBlankField(inline?: boolean): this {
		return this.addField('\u200b', '\u200b', inline);
	}

	/**
	 * Add a field to the embed.
	 * @param name The field name.
	 * @param value The field value.
	 * @param inline If the field should be inline.
	 */

	addField(name: string, value: string, inline?: boolean): this {
		if (name.length > 256) name = this.trim(name, 256);
		if (value.length > 1024) value = this.trim(value, 1024);
		this.json.fields = [...(this.json.fields ?? []), { name, value, inline }];
		return this;
	}

	/**
	 * Add multiple fields.
	 * @param fields - the fields to add
	 */

	addFields(fields: Array<EmbedField>): this {
		fields.forEach((arg) => this.addField(arg.name, arg.value, arg.inline));
		return this;
	}

	/**
	 * Get the current author.
	 */

	getAuthor(): EmbedAuthorOptions | undefined {
		return this.json.author;
	}

	/**
	 * Get the current color.
	 */

	getColor(): number | undefined {
		return this.json.color;
	}

	/**
	 * Get the current description.
	 */

	getDescription(): string | undefined {
		return this.json.description;
	}

	/**
	 * Get the field at the specified index.
	 * @param index The index of the field to get.
	 */

	getField(index: number): EmbedField | undefined {
		return (this.json.fields ?? [])[index];
	}

	/**
	 * Get the current fields.
	 */

	getFields(): Array<EmbedField> {
		return this.json.fields ?? [];
	}

	/**
	 * Get the current footer.
	 */

	getFooter(): EmbedFooterOptions | undefined {
		return this.json.footer;
	}

	/**
	 * Get the current image.
	 */

	getImage(): EmbedImageOptions | undefined {
		return this.json.image;
	}

	/**
	 * Get the current thumbnail.
	 */

	getThumbnail(): EmbedImageOptions | undefined {
		return this.json.thumbnail;
	}

	/**
	 * Get the current timestamp.
	 */

	getTimestamp(): string | undefined {
		return this.json.timestamp;
	}

	/**
	 * Get the current timestamp as a date instance.
	 */

	getTimestampDate(): Date | undefined {
		return !this.json.timestamp ? undefined : new Date(this.json.timestamp);
	}

	/**
	 * Get the current title.
	 */

	getTitle(): string | undefined {
		return this.json.title;
	}

	/**
	 * Get the current url.
	 */

	getURL(): string | undefined {
		return this.json.url;
	}

	/**
	 * remove the current author
	 * @returns {this}
	 */

	removeAuthor(): this {
		this.json.author = undefined;
		return this;
	}

	/**
	 * Remove the current color.
	 */

	removeColor(): this {
		this.json.color = undefined;
		return this;
	}

	/**
	 * Remove the current description.
	 */

	removeDescription(): this {
		this.json.description = undefined;
		return this;
	}

	/**
	 * Remove the current footer.
	 */

	removeFooter(): this {
		this.json.footer = undefined;
		return this;
	}

	/**
	 * Remove the current image.
	 */

	removeImage(): this {
		this.json.image = undefined;
		return this;
	}

	/**
	 * Remove the current thumbnail.
	 */

	removeThumbnail(): this {
		this.json.thumbnail = undefined;
		return this;
	}

	/**
	 * Remove the current timestamp.
	 */

	removeTimestamp(): this {
		this.json.timestamp = undefined;
		return this;
	}

	/**
	 * Remove the current title.
	 */

	removeTitle(): this {
		this.json.title = undefined;
		return this;
	}

	/**
	 * Remove the current url.
	 */

	removeURL(): this {
		this.json.url = undefined;
		return this;
	}

	/**
	 * Set the embed author
	 * @param name The name of the author.
	 * @param iconURL An icon url for the author.
	 * @param url A url for the author.
	 */

	setAuthor(name: string, iconURL?: string, url?: string): this {
		if (name.length > 256) name = this.trim(name, 256);
		this.json.author = {
			name,
			iconURL,
			url,
		};
		return this;
	}

	/**
	 * Set the embed color.
	 * @param color The color.
	 */

	setColor(color: number | string): this {
		if (typeof color === 'string') {
			const colorList: any = {
				red: 0xff0000,
				orange: 0xffa500,
				yellow: 0xffff00,
				green: 0x00ff00,
				cyan: 0x00ffff,
				blue: 0x0000ff,
				pink: 0xffc0cb,
				violet: 0xee82ee,
				purple: 0x800080,
				black: 0x000000,
				white: 0xffffff,
			};

			this.json.color = Number(colorList[color.toLowerCase()] || 0x000000);
		} else {
			this.json.color = color;
		}
		return this;
	}

	/**
	 * Set the embed description.
	 * @param value The description. A string, array of strings, or both spread across multiple parameters. They will be joined by LF charactes.
	 */

	setDescription(first: string | Array<string>, ...other: Array<string | Array<string>>): this {
		this.json.description = [
			...(Array.isArray(first) ? first : [first]),
			...other.map((o) => [...(Array.isArray(o) ? o : [o])].join('\n')),
		].join('\n');
		if (this.json.description.length > 4096) this.json.description = this.trim(this.json.description, 4096);
		return this;
	}

	/**
	 * Set the embed footer.
	 * @param text - The text.
	 * @param iconURL - The icon url.
	 */

	setFooter(text: string, iconURL?: string): this {
		if (text.length > 2048) text = this.trim(text, 2048);
		this.json.footer = { text, iconURL };
		return this;
	}

	/**
	 * Set the embed image.
	 * @param url The Image url.
	 */

	setImage(url: string): this {
		this.json.image = { url };
		return this;
	}

	/**
	 * Set a random color.
	 */

	setRandomColor(): this {
		const base = '0123456789ABCDEF';
		let color = '0x';

		for (let count = 0; count < 6; count++) {
			color = color + base[Math.floor(Math.random() * 16)];
		}

		this.json.color = Number(color);
		return this;
	}

	/**
	 * Set the embed thumbnail.
	 * @param url The thumbnail url.
	 */

	setThumbnail(url: string): this {
		this.json.thumbnail = { url };
		return this;
	}

	/**
	 * Set the embed timestamp.
	 * @param time An ISO 8601 timestamp, Date object, or "now".
	 */

	setTimestamp(time?: string | Date | 'now'): this {
		if (!time) time = new Date().toISOString();
		if (time === 'now') {
			time = new Date().toISOString();
		} else if (time instanceof Date) {
			time = time.toISOString();
		}
		this.json.timestamp = time;
		return this;
	}

	/**
	 * Set the embed title.
	 * @param title The title.
	 */

	setTitle(title: string): this {
		this.json.title = this.trim(title, 256);
		return this;
	}

	/**
	 * Set the embed url.
	 * @param url The url.
	 */

	setURL(url: string): this {
		this.json.url = url;
		return this;
	}

	/**
	 * Trim amount of characters.
	 * @param str Message that you want to trim.
	 * @param max Amount of characters that you want to trim to.
	 * @returns string
	 */

	trim(str: string, max: number): string {
		return str.length > max ? `${str.slice(0, max - 3)}...` : str;
	}

	/**
	 * Convert this embed to a json object.
	 * @param array If the returned value should be contained in an array.
	 */

	toJSON(array: true): [EmbedOptions];
	toJSON(array?: false): EmbedOptions;
	toJSON(array = false): [EmbedOptions] | EmbedOptions {
		return array ? [this.json] : this.json;
	}

	/**
	 * Convert this embed to a raw json object.
	 * @param array If the returned value should be contained in an array.
	 */
	toJSONRaw(array: true): [RawEmbedOptions];
	toJSONRaw(array?: false): RawEmbedOptions;
	toJSONRaw(array = false): [RawEmbedOptions | undefined] | RawEmbedOptions | undefined {
		const [embed] = Util.prototype.embedsToRaw([this.json]);
		return array ? [embed] : embed;
	}
}
