import BotClient from '../../client';
import Builders from '../../utils/builders';
import Event from '../../interfaces/event';
import { ExecuteReturnType } from '../../types/additional';

export default class ShardReadyEvent extends Event<'shardReady'> {
	public override data = new Builders.Event('shardReady', false).toJSON();

	public async execute(client: BotClient, id: number): ExecuteReturnType {
		client.utils.logger({ title: 'ShardReady', content: `Shard ${id}: Ready!`, type: 1 });
	}
}
