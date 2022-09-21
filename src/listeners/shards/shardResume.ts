import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import EventInterface from '../../interfaces/event';

export default class ShardResumeEvent extends EventInterface {
	public override data = new Builders.Event('shardResume', false).toJSON();

	public async execute(client: BotClient, id: number): Promise<void> {
		client.utils.logger({ title: 'ShardResume', content: `Shard ${id}: Resumed`, type: 1 });
	}
}
