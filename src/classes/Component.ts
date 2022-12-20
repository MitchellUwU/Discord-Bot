import type { AnyGuildTextChannel, ComponentInteraction, ComponentTypes, SelectMenuTypes } from 'oceanic.js';
import type { ParentData } from '../types/options';
import type BotClient from './Client';

export default abstract class Component {
	client: BotClient;
	abstract id: string;
	abstract execute(
		interaction: ComponentInteraction<ComponentTypes.BUTTON | SelectMenuTypes, AnyGuildTextChannel>,
		parentData: ParentData
	): Promise<void> | void;

	constructor(client: BotClient) {
		this.client = client;
	}
}
