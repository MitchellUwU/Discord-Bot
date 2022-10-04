import BotClient from '../../client';
import Builders from '../../utils/builders';
import Event from '../../interfaces/event';

export default class ReadyEvent extends Event<'ready'> {
	public override data = new Builders.Event('ready', true).toJSON();

	public async execute(client: BotClient): Promise<void> {
		client.utils.logger({ title: 'Ready', content: 'Client is ready!', type: 1 });
	}
}
