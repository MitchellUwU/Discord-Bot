import type BotClient from './Client';
import type { AnyGuildTextChannel, CommandInteraction, CreateApplicationCommandOptions } from 'oceanic.js';

export default abstract class Command {
	abstract data: CreateApplicationCommandOptions;
	abstract execute(client: BotClient, interaction: CommandInteraction<AnyGuildTextChannel>): Promise<void> | void;
}
