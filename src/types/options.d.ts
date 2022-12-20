import { ComponentTypes } from 'oceanic.js';

export interface LoggerOptions {
	title: string;
	content: unknown;
	type: 1 | 2 | 3 | 4;
}

export interface ParentData {
	userID: string;
	interactionID: string;
	componentID: string;
	addition?: string;
}

export type ArrayParentData = [
	userID: string,
	interactionID: string,
	componentID: string,
	addition?: string,
]
