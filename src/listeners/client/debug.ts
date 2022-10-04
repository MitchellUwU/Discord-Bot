import BotClient from '../../client';
import Builders from '../../utils/builders';
import Event from '../../interfaces/event';

export default class DebugEvent extends Event<'debug'> {
	public override data = new Builders.Event('debug', false).toJSON();

	public async execute(client: BotClient, msg: string, id: number): Promise<void> {
		if (client.config.disableDebug === true) return;
		if (msg.startsWith('{"op"')) return;

		if (!id) {
			return client.utils.logger({
				title: 'Debug',
				content: `Client: ${msg}`.replace(' undefined', ''),
				type: 4,
			});
		} else {
			client.utils.logger({
				title: 'Debug',
				content: `Shard ${id}: ${msg}`.replace(' undefined', ''),
				type: 4,
			});
		}
	}
}
