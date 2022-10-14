import * as Lib from 'oceanic.js';

export type AnyGuildInteractionNonAutoComplete =
	| Lib.CommandInteraction<Lib.AnyGuildTextChannel>
	| Lib.ComponentInteraction<Lib.AnyGuildTextChannel>
	| Lib.ModalSubmitInteraction<Lib.AnyGuildTextChannel>;

export type AnyInteractionNonAutoComplete =
	| Lib.CommandInteraction
	| Lib.ComponentInteraction
	| Lib.ModalSubmitInteraction;
