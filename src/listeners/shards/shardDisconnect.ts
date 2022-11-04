import Event from '../../classes/Event';

export default new Event('shardDisconnect', false, async (client, error, id) => {
	client.utils.logger({
		title: 'ShardDisconnect',
		content: `Shard ${id}: Disconnected due to ${error || 'No reason provided'}`,
		type: 2,
	});
});
