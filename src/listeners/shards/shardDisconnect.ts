import BotClient from '../../client';
import { Builders } from '../../utils/builders';
import EventInterface from '../../interfaces/event';

export default class ShardDisconnectEvent extends EventInterface<'shardDisconnect'> {
	public override data = new Builders.Event('shardDisconnect', false).toJSON();

	public async execute(client: BotClient, error: Error, id: number): Promise<void> {
		client.utils.logger({
			title: 'ShardDisconnect',
			content: `Shard ${id}: Disconnected due to ${error || 'No reason provided'}`,
			type: 2,
		});
	}
}
