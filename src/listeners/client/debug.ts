import Event from '../../classes/Event';
import config from '../../../config.json';

export default new Event('debug', false, async (client, msg, id) => {
	if (config.devMode !== true) return;
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
});