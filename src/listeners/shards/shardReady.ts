import Event from '../../classes/Event';

export default new Event('shardReady', false, async (client, id) => {
	client.utils.logger({ title: 'ShardReady', content: `Shard ${id}: Ready!`, type: 1 });
});
