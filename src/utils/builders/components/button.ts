import { ButtonBase } from 'oceanic.js';

export default class ButtonBuilder {
	private json: any;

	public constructor(style: number, customID: string, label: string) {
		this.json = {};
		this.json.type = 2;
		this.json.style = style;
		this.json.customID = customID;
		this.json.label = label;
	}

	public setStyle(style: number): this {
		this.json.style = style;
		return this;
	}

	public setLabel(content: string): this {
		this.json.label = content;
		return this;
	}

	public setCustomID(id: string): this {
		this.json.customID = id;
		return this;
	}

	public setURL(url: string): this {
		this.json.url = url;
		return this;
	}

	public setEmoji(emoji: string): this {
		this.json.emoji = emoji;
		return this;
	}

	public setDisabled(disabled: boolean): this {
		this.json.disabled = disabled;
		return this;
	}

	public toJSON(): ButtonBase {
		return this.json;
	}
}
