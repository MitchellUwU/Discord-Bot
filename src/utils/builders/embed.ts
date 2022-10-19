import { EmbedAuthor, EmbedField, EmbedFooter, EmbedOptions } from 'oceanic.js';
import { EmbedBuilder } from '@oceanicjs/builders';

export default class ExtendedEmbedBuilder extends EmbedBuilder {
	public constructor() {
		super();
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

			this['json'].color = Number(colorList[color.toLowerCase()] || 0x000000);
		} else {
			this['json'].color = color;
		}
		return this;
	}

	public setRandomColor(): this {
		const base = '0123456789ABCDEF';
		let color = '0x';

		for (let count = 0; count < 6; count++) {
			color = color + base[Math.floor(Math.random() * 16)];
		}

		this['json'].color = Number(color);
		return this;
	}

	public setTimestamp(time?: string | Date): this {
		if (!time) time = new Date().toISOString();
		if (time === 'now') time = new Date().toISOString();
		if (time instanceof Date) time = time.toISOString();
		this['json'].timestamp = time;
		return this;
	}
}
