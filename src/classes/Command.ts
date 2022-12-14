import type BotClient from './Client';
import type {
	AnyGuildTextChannel,
	CommandInteraction,
	CreateApplicationCommandOptions,
	PermissionName,
} from 'oceanic.js';

export default abstract class Command {
	client: BotClient;
	abstract data: CreateApplicationCommandOptions;
	abstract execute(interaction: CommandInteraction<AnyGuildTextChannel>): Promise<void> | void;

	constructor(client: BotClient) {
		this.client = client;
	}

	userPermission: PermissionName | bigint = 'USE_APPLICATION_COMMANDS';
}
