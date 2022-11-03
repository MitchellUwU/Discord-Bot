import BotClient from '../../classes/Client';
import Builders from '../../classes/Builders';
import Event from '../../classes/Event';
import { ExecuteReturnType } from '../../types/additional';

export default class WarnEvent extends Event<'warn'> {
	public override data = new Builders.Event('warn', false).toJSON();

	public async execute(client: BotClient, msg: string, id: number): ExecuteReturnType {
		if (!id) return client.utils.logger({ title: 'Warn', content: `${msg}`, type: 3 });

		client.utils.logger({ title: 'Warn', content: `Shard ${id}: ${msg}`, type: 3 });
	}
}
