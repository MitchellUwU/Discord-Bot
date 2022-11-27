import {
	ComponentBuilder,
	Button as ButtonBuilder,
	SelectMenu as SelectMenuBuilder,
	TextInput as TextInputBuilder,
} from '@oceanicjs/builders';
import type { MessageActionRow, ModalActionRow } from 'oceanic.js';
import ChoiceBuilder from './builders/commands/Choice';
import CommandBuilder from './builders/commands/Command';
import OptionBuilder from './builders/commands/Option';
import EmbedBuilder from './builders/Embed';

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

function ErrorEmbed() {
	return new Embed().setColor('red').setTitle('⛔ error!').setTimestamp();
}

function SuccessEmbed() {
	return new Embed().setColor('green').setTitle('✅ success!').setTimestamp();
}

function WarnEmbed() {
	return new Embed().setColor('yellow').setTitle('⚠️ warning!').setTimestamp();
}

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
	ErrorEmbed,
	SuccessEmbed,
	WarnEmbed,
};

// Export all builders.

export default Builders;
