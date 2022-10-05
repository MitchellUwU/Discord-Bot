// (yes, i do know about the oceanic-collectors package but i prefer using my own version)

import BotClient from '../client';
import { EventEmitter } from 'events';
import * as Lib from 'oceanic.js';

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

// Collector manager.

export class Collectors {
	private activeListeners: any = []; // [INTERNAL] Array of active listeners.

	/**
	 * Create a new collector.
	 * @param options Any content.
	 * @returns InteractionCollector
	 */

	public createNewCollector(options: InteractionCollectorConfig): InteractionCollector {
		const activeCollector = this.activeListeners[options.authorID];
		activeCollector?.stop('another collector has been used');

		delete this.activeListeners[options.authorID];

		const collector = new InteractionCollector(options);
		collector.once('end', () => delete this.activeListeners[options.authorID]);

		this.activeListeners[options.authorID] = collector;

		return collector;
	}
}

/**
 * Interaction Collector.
 * @extends Lib.EventEmitter from node.js events.
 */

export class InteractionCollector extends EventEmitter {
	public authorID: string; // User ID that triggers the collector.
	private client: BotClient; // [INTERNAL] The main client.
	private collected: { interaction: Lib.AnyInteractionGateway }[]; // [INTERNAL] All collected interactions.
	public componentType: boolean; // Component type.
	private ended: boolean; // [INTERNAL] Value telling collector state.
	public interaction: Lib.AnyInteractionGateway; // Interaction that triggers the collector.
	public interactionType: any; // Interaction type.
	private listenerValue: (interaction: Lib.AnyInteractionGateway) => void; // [INTERNAL] Listener function.
	public max: number | undefined; // Max interaction limit.
	public time: number; // Collector time.
	private timer: NodeJS.Timeout; // [INTERNAL] Collector timer.

	/**
	 * Interaction Collector constructor.
	 * @param options Collector configuration.
	 */

	public constructor(options: InteractionCollectorConfig) {
		super();

		this.authorID = options.authorID;
		this.client = options.client;
		this.interaction = options.interaction;
		this.componentType = options.componentType;
		this.interactionType = options.interactionType;
		this.max = options.max || undefined;
		this.time = options.time || Infinity;

		this.collected = [];
		this.ended = false;

		this.listenerValue = (interaction: Lib.AnyInteractionGateway) => this.checkInteraction(interaction);
		this.client.on('interactionCreate', this.listenerValue);

		this.timer = setTimeout(() => this.stop('time limit reached'), this.time);
	}

	/**
	 * Check incoming interaction.
	 * @param interaction Incoming interaction.
	 * @returns boolean
	 */

	private checkInteraction(interaction: any): boolean {
		if (!(interaction instanceof this.interactionType)) return false;
		if (!interaction.data.component_type === this.componentType) return false;
		if (interaction.user.id !== this.authorID) return false;

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

	public extendTimeout(time: number): void {
		if (!this.time) return;
		clearTimeout(this.timer);
		const extendedTime: number = time + this.time;
		this.timer = setTimeout(() => this.stop('time limit reached'), extendedTime);
	}

	/**
	 * Change Timer.
	 * @param time Amount of time to change to.
	 * @returns void
	 */

	public changeTimeout(time: number): void {
		this.time = time;
		clearTimeout(this.timer);
		this.timer = setTimeout(() => this.stop('time limit reached'), time);
	}

	/**
	 * Remove Timer.
	 * @returns void
	 */

	public removeTimeout(): void {
		if (!this.time) return;
		clearTimeout(this.timer);
	}

	/**
	 * Stop the collector.
	 * @param reason The reason to end the collector.
	 * @returns void
	 */

	public stop(reason: string): void {
		if (this.ended) return;
		this.ended = true;
		this.client.removeListener('interactionCreate', this.listenerValue);
		this.emit('end', this.collected, reason);
	}
}
