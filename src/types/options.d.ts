import { ComponentTypes } from 'oceanic.js';
import { PoolConfig } from 'pg';

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
	db: PoolConfig;
	devMode: boolean;
	devIDs: string[];
	disableDebug?: boolean;
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
	type: number;
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

// Event options

export interface EventOptions {
	name: string;
	once: boolean;
	type: string;
}