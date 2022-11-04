import Event from '../../classes/Event';

export default new Event('shardResume', false, async (client, id) => {
	client.utils.logger({ title: 'ShardResume', content: `Shard ${id}: Resumed`, type: 1 });
});
