import { ApplicationCommandType } from 'discord-api-types/v10';
import BotClient from '../client';
import { Builders } from '../utils/builders';
import { CreateApplicationCommandOptions } from 'oceanic.js';
import InteractionWrapper from '../utils/interactionWrapper';

export default class CommandInterface {
	private client: BotClient;
	public data: CreateApplicationCommandOptions = new Builders.Command(
		ApplicationCommandType.ChatInput,
		'placeholder'
	).setDescription("looks like the devs messed up!").toJSON();

	public constructor(client: BotClient) {
		this.client = client;
	}

	public async execute(client: BotClient, interaction: InteractionWrapper): Promise<void> {
		this.client.utils.logger({ title: this.data.name, content: 'this works!', type: 1 });
	}
}
