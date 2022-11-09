// (yes, i do know about the oceanic-collectors package but i prefer using my own version)

import BotClient from './Client';
import { EventEmitter } from 'events';
import { InteractionCollectorConfig } from '../types/options';
import { AnyInteractionGateway, ComponentInteraction, ComponentTypes } from 'oceanic.js';

// Collector manager.

export class Collectors {
	private activeListeners: Map<string, InteractionCollector> = new Map(); // [INTERNAL] Array of active listeners.

	/**
	 * Create a new collector.
	 * @param options Collector configuration.
	 * @returns InteractionCollector
	 */

	create(options: InteractionCollectorConfig): InteractionCollector {
		const activeCollector = this.activeListeners.get(options.authorID);
		activeCollector?.stop('another collector has been used');

		this.activeListeners.delete(options.authorID);

		const collector = new InteractionCollector(options);
		collector.once('end', () => this.activeListeners.delete(options.authorID));

		this.activeListeners.set(options.authorID, collector);

		return collector;
	}
}

/**
 * Interaction Collector.
 * @extends Lib.EventEmitter from node.js events.
 */

export class InteractionCollector extends EventEmitter {
	private client: BotClient;
	private collected: { interaction: AnyInteractionGateway }[];
	private listenerValue: (interaction: AnyInteractionGateway) => void;
	private timer: NodeJS.Timeout;
	private ended: boolean;
	authorID: string;
	componentType: ComponentTypes
	interaction: AnyInteractionGateway;
	interactionType: any;
	max: number | undefined;
	time: number;
	constructor(options: InteractionCollectorConfig) {
		super();

		this.authorID = options.authorID;
		this.client = options.client;
		this.componentType = options.componentType;
		this.interaction = options.interaction;
		this.interactionType = options.interactionType;
		this.max = options.max || undefined;
		this.time = options.time || Infinity;

		this.collected = [];
		this.ended = false;

		this.listenerValue = (interaction) => this.checkInteraction(interaction);
		this.client.on('interactionCreate', this.listenerValue);

		this.timer = setTimeout(() => this.stop('time limit reached'), this.time);
	}

	/**
	 * Check incoming interaction.
	 * @param interaction Incoming interaction.
	 * @returns boolean
	 */

	checkInteraction(interaction: AnyInteractionGateway): boolean {
		if (!(interaction instanceof this.interactionType)) return false;
		if (interaction.user.id !== this.authorID) return false;
		if (interaction instanceof ComponentInteraction) {
			if (interaction.data.componentType !== this.componentType) return false;
		}

		this.emit('collect', interaction);

		this.collected.push({ interaction });

		if (this.max) {
			if (this.collected.length >= this.max) {
				this.stop('max interaction limit reached');
				return true;
			}
		}

		return true;
	}

	/**
	 * Extend Timer.
	 * @param time Amount of time to extend.
	 * @returns void
	 */

	extendTimeout(time: number): void {
		if (!this.time) return;
		clearTimeout(this.timer);
		const extendedTime = time + this.time;
		this.timer = setTimeout(() => this.stop('time limit reached'), extendedTime);
	}

	/**
	 * Change Timer.
	 * @param time Amount of time to change to.
	 * @returns void
	 */

	changeTimeout(time: number): void {
		this.time = time;
		clearTimeout(this.timer);
		this.timer = setTimeout(() => this.stop('time limit reached'), time);
	}

	/**
	 * Remove Timer.
	 * @returns void
	 */

	removeTimeout(): void {
		if (!this.time) return;
		clearTimeout(this.timer);
	}

	/**
	 * Stop the collector.
	 * @param reason The reason to end the collector.
	 * @returns void
	 */

	stop(reason: string): void {
		if (this.ended) return;
		this.ended = true;
		this.client.removeListener('interactionCreate', this.listenerValue);
		this.emit('end', this.collected, reason);
	}
}
