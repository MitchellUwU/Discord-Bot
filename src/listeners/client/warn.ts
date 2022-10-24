import BotClient from '../../client';
import Builders from '../../utils/builders';
import Event from '../../interfaces/event';
import { ExecuteReturnType } from '../../types/additional';

export default class WarnEvent extends Event<'warn'> {
	public override data = new Builders.Event('warn', false).toJSON();

	public async execute(client: BotClient, msg: string, id: number): ExecuteReturnType {
		if (!id) return client.utils.logger({ title: 'Warn', content: `${msg}`, type: 3 });

		client.utils.logger({ title: 'Warn', content: `Shard ${id}: ${msg}`, type: 3 });
	}
}
