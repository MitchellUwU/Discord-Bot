import { EmbedAuthor, EmbedField, EmbedFooter, EmbedOptions } from 'oceanic.js';

export default class EmbedBuilder {
	private json: EmbedOptions;

	public constructor() {
		this.json = {};
	}

	public trim(str: string, max: number) {
		return str.length > max ? `${str.slice(0, max - 3)}...` : str;
	}

	public setAuthor(options: EmbedAuthor): this {
		if (options.name.length > 256) options.name = this.trim(options.name, 256);
		this.json.author = options;
		return this;
	}

	public setColor(color: number | string): this {
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

	public setRandomColor(): this {
		const base = '0123456789ABCDEF';
		let color = '0x';
		for (let count = 0; count < 6; count++) {
			color = color + base[Math.floor(Math.random() * 16)];
		}

		this.json.color = Number(color);
		return this;
	}

	public setDescription(content: string): this {
		this.json.description = this.trim(content, 4096);
		return this;
	}

	public addField(options: EmbedField): this {
		if (options.name.length > 256) options.name = this.trim(options.name, 256);
		if (options.value.length > 1024) options.value = this.trim(options.value, 1024);
		this.json.fields = [...(this.json.fields ?? []), options];
		return this;
	}

	public addEmptyField(inline: boolean): this {
		return this.addField({ name: '\u200b', value: '\u200b', inline: inline });
	}

	public addFields(fields: EmbedField[]): this {
		fields.forEach((arg: any) => this.addField(arg));
		return this;
	}

	public setFooter(options: EmbedFooter): this {
		if (options.text.length > 2048) options.text = this.trim(options.text, 2048);
		this.json.footer = options;
		return this;
	}

	public setImage(url: string): this {
		this.json.image = { url: url };
		return this;
	}

	public setThumbnail(url: string): this {
		this.json.thumbnail = { url: url };
		return this;
	}

	public setTimestamp(time?: string | Date): this {
		if (!time) time = new Date().toISOString();
		if (time === 'now') time = new Date().toISOString();
		if (time instanceof Date) time = time.toISOString();
		this.json.timestamp = time;
		return this;
	}

	public setTitle(title: string): this {
		this.json.title = this.trim(title, 256);
		return this;
	}

	public setURL(url: string): this {
		this.json.url = url;
		return this;
	}

	public toJSON(): EmbedOptions {
		return this.json;
	}
}
