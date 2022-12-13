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

export interface ParentData {
	userID: string;
	interactionID: string;
	componentID: string;
}

export type ArrayParentData = [
	userID: string,
	interactionID: string,
	componentID: string,
]
