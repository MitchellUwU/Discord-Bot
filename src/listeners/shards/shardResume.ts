import BotClient from '../../client';
import Builders from '../../utils/builders';
import Event from '../../interfaces/event';

export default class ShardResumeEvent extends Event<'shardResume'> {
	public override data = new Builders.Event('shardResume', false).toJSON();

	public async execute(client: BotClient, id: number): Promise<void> {
		client.utils.logger({ title: 'ShardResume', content: `Shard ${id}: Resumed`, type: 1 });
	}
}
