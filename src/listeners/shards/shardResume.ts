import BotClient from '../../classes/Client';
import Builders from '../../classes/Builders';
import Event from '../../classes/Event';
import { ExecuteReturnType } from '../../types/additional';

export default class ShardResumeEvent extends Event<'shardResume'> {
	public override data = new Builders.Event('shardResume', false).toJSON();

	public async execute(client: BotClient, id: number): ExecuteReturnType {
		client.utils.logger({ title: 'ShardResume', content: `Shard ${id}: Resumed`, type: 1 });
	}
}
