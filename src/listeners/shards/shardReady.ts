import BotClient from '../../classes/Client';
import Builders from '../../classes/Builders';
import Event from '../../classes/Event';
import { ExecuteReturnType } from '../../types/additional';

export default class ShardReadyEvent extends Event<'shardReady'> {
	public override data = new Builders.Event('shardReady', false).toJSON();

	public async execute(client: BotClient, id: number): ExecuteReturnType {
		client.utils.logger({ title: 'ShardReady', content: `Shard ${id}: Ready!`, type: 1 });
	}
}
