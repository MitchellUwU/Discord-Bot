import {
	ComponentBuilder,
	Button as ButtonBuilder,
	SelectMenu as SelectMenuBuilder,
	TextInput as TextInputBuilder,
} from '@oceanicjs/builders';
import { MessageActionRow, ModalActionRow } from 'oceanic.js';
import ChoiceBuilder from './builders/commands/choice';
import CommandBuilder from './builders/commands/command';
import OptionBuilder from './builders/commands/option';
import EmbedBuilder from './builders/embed';
import EventBuilder from './builders/event';

// Aliases for the builders.

const Command = CommandBuilder;
const Option = OptionBuilder;
const Choice = ChoiceBuilder;
const Embed = EmbedBuilder;
const Modal = ComponentBuilder<ModalActionRow>;
const ActionRow = ComponentBuilder<MessageActionRow>;
const Button = ButtonBuilder;
const SelectMenu = SelectMenuBuilder;
const TextInput = TextInputBuilder;
const Event = EventBuilder;

const Builders = {
	Choice,
	Command,
	Option,
	Embed,
	Modal,
	ActionRow,
	Button,
	SelectMenu,
	TextInput,
	Event,
};

// Export all builders.

export default Builders;
