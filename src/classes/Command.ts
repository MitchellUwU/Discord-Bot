import type BotClient from './Client';
import type {
	AnyGuildTextChannel,
	CommandInteraction,
	CreateApplicationCommandOptions,
	PermissionName,
} from 'oceanic.js';

export default abstract class Command {
	abstract data: CreateApplicationCommandOptions;
	abstract execute(
		client: BotClient,
		interaction: CommandInteraction<AnyGuildTextChannel>
	): Promise<void> | void;
	userPermission: PermissionName | bigint = 'USE_APPLICATION_COMMANDS';
}
