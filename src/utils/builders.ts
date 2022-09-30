// (yes, i do know about the official @oceanic.js/builders but i prefer using my own version)

import ChoiceBuilder from './builders/commands/choice';
import CommandBuilder from './builders/commands/command';
import OptionBuilder from './builders/commands/option';
import ActionRowBuilder from './builders/components/actionRow';
import ButtonBuilder from './builders/components/button';
import ModalBuilder from './builders/components/modal';
import SelectMenuBuilder from './builders/components/selectMenu';
import TextInputBuilder from './builders/components/textInput';
import EmbedBuilder from './builders/embed';
import EventBuilder from './builders/event';

// Aliases for the builders.

const Command = CommandBuilder;
const Option = OptionBuilder;
const Choice = ChoiceBuilder;
const Embed = EmbedBuilder;
const Modal = ModalBuilder;
const ActionRow = ActionRowBuilder;
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