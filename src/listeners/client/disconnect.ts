import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import EventInterface from '../../interfaces/event';

export default class DisconnectEvent extends EventInterface {
	public override data = new Builders.Event('disconnect', false).toJSON();

	public async execute(client: BotClient): Promise<void> {
		client.utils.logger({ title: 'Disconnect', content: 'Client disconnected', type: 2 });
	}
}
