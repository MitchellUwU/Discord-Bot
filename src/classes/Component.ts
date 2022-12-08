import type BotClient from './Client';
import type {
	AnyGuildTextChannel,
	CommandInteraction,
	ComponentInteraction,
	ComponentTypes,
	SelectMenuTypes,
} from 'oceanic.js';

export default abstract class Component {
	abstract id: string;
	abstract execute(
		client: BotClient,
		interaction: ComponentInteraction<ComponentTypes.BUTTON | SelectMenuTypes, AnyGuildTextChannel>,
		parentData: CommandInteraction<AnyGuildTextChannel>
	): Promise<void> | void;
  abstract disable(
		client: BotClient,
		interaction: ComponentInteraction<ComponentTypes.BUTTON | SelectMenuTypes, AnyGuildTextChannel>,
		parentData: CommandInteraction<AnyGuildTextChannel>
	): Promise<void> | void
}
