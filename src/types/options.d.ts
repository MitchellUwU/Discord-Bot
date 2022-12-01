import { ComponentTypes } from 'oceanic.js';

// Client configuration interface.

export interface BotConfig {
	answers: {
		repliesTemplate: string[];
		answers: string[];
		pronouns: string[];
		faces: string[];
	};
	ascii?: string[];
	clientOptions: Lib.ClientOptions;
	blockedGuilds?: string[];
	blockedUsers?: string[];
	devMode: boolean;
	devIDs: string[];
	guildID?: string;
	requiredPermission: number;
	statusOptions: {
		type: string;
		activities: Lib.BotActivity[];
	};
}

// Logger configuration interface.

export interface LoggerOptions {
	title: string;
	content: unknown;
	type: 1 | 2 | 3 | 4;
}

// Collector configuration interface.

export interface InteractionCollectorConfig {
	authorID: string;
	client: BotClient;
	componentType: any;
	interaction: any;
	interactionType: any;
	max?: number;
	time?: number;
}
