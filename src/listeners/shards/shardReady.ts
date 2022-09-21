import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import EventInterface from '../../interfaces/event';

export default class ShardReadyEvent extends EventInterface {
	public override data = new Builders.Event('shardReady', false).toJSON();

	public async execute(client: BotClient, id: number): Promise<void> {
		client.utils.logger({ title: 'ShardReady', content: `Shard ${id}: Ready!`, type: 1 });
	}
}
