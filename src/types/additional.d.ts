import * as Lib from 'oceanic.js';

export type AnyGuildInteractionNonAutoComplete =
	| Lib.CommandInteraction<Lib.AnyGuildTextChannel>
	| Lib.ComponentInteraction<Lib.ComponentTypes.BUTTON, Lib.AnyGuildTextChannel>
	| Lib.ComponentInteraction<Lib.ComponentTypes.ROLE_SELECT, Lib.AnyGuildTextChannel>
	| Lib.ComponentInteraction<Lib.ComponentTypes.USER_SELECT, Lib.AnyGuildTextChannel>
	| Lib.ComponentInteraction<Lib.ComponentTypes.CHANNEL_SELECT, Lib.AnyGuildTextChannel>
	| Lib.ComponentInteraction<Lib.ComponentTypes.MENTIONABLE_SELECT, Lib.AnyGuildTextChannel>
	| Lib.ComponentInteraction<Lib.ComponentTypes.STRING_SELECT, Lib.AnyGuildTextChannel>
	| Lib.ModalSubmitInteraction<Lib.AnyGuildTextChannel>;

export type AnyInteractionNonAutoComplete =
	| Lib.CommandInteraction
	| Lib.ComponentInteraction<Lib.ComponentTypes.BUTTON>
	| Lib.ComponentInteraction<Lib.ComponentTypes.ROLE_SELECT>
	| Lib.ComponentInteraction<Lib.ComponentTypes.USER_SELECT>
	| Lib.ComponentInteraction<Lib.ComponentTypes.CHANNEL_SELECT>
	| Lib.ComponentInteraction<Lib.ComponentTypes.MENTIONABLE_SELECT>
	| Lib.ComponentInteraction<Lib.ComponentTypes.STRING_SELECT>
	| Lib.ModalSubmitInteraction;
