import * as Lib from 'oceanic.js';

export type AnyGuildInteractionNonAutoComplete =
	| Lib.CommandInteraction<Lib.AnyGuildTextChannel>
	| Lib.ComponentInteraction<Lib.AnyGuildTextChannel>
	| Lib.ModalSubmitInteraction<Lib.AnyGuildTextChannel>;

export type AnyInteractionNonAutoComplete =
	| Lib.CommandInteraction
	| Lib.ComponentInteraction
	| Lib.ModalSubmitInteraction;

export type EventListener = (
	client: BotClient,
	...args: Lib.ClientEvents[K]
) => Promise<void | Lib.Message<Lib.AnyGuildTextChannel>>;

export type ExecuteReturnType = Promise<void | Lib.Message<Lib.AnyGuildTextChannel>>;
