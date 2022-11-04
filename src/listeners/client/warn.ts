import Event from '../../classes/Event';

export default new Event('warn', false, async (client, msg, id) => {
	if (!id) return client.utils.logger({ title: 'Warn', content: `${msg}`, type: 3 });
	client.utils.logger({ title: 'Warn', content: `Shard ${id}: ${msg}`, type: 3 });
});
