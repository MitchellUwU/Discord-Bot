import BotClient from '../../classes/Client';
import Builders from '../../classes/Builders';
import Event from '../../classes/Event';
import { ExecuteReturnType } from '../../types/additional';

export default class ShardDisconnectEvent extends Event<'shardDisconnect'> {
	public override data = new Builders.Event('shardDisconnect', false).toJSON();

	public async execute(client: BotClient, error: Error, id: number): ExecuteReturnType {
		client.utils.logger({
			title: 'ShardDisconnect',
			content: `Shard ${id}: Disconnected due to ${error || 'No reason provided'}`,
			type: 2,
		});
	}
}
