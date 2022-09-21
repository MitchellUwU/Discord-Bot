import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import EventInterface from '../../interfaces/event';

export default class WarnEvent extends EventInterface {
	public override data = new Builders.Event('warn', false).toJSON();

	public async execute(client: BotClient, msg: string, id: number): Promise<void> {
		if (!id) return client.utils.logger({ title: 'Warn', content: `${msg}`, type: 3 });
		
		client.utils.logger({ title: 'Warn', content: `Shard ${id}: ${msg}`, type: 3 });
	}
}
