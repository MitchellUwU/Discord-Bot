import type BotClient from './Client';
import type {
	AnyGuildTextChannel,
	ComponentInteraction,
	ComponentTypes,
	SelectMenuTypes,
} from 'oceanic.js';
import type { ParentData } from '../types/options';

export default abstract class Component {
	abstract id: string;
	abstract execute(
		client: BotClient,
		interaction: ComponentInteraction<ComponentTypes.BUTTON | SelectMenuTypes, AnyGuildTextChannel>,
		parentData: ParentData
	): Promise<void> | void;
  abstract disable(
		client: BotClient,
		interaction: ComponentInteraction<ComponentTypes.BUTTON | SelectMenuTypes, AnyGuildTextChannel>,
		parentData: ParentData
	): Promise<void> | void
}
