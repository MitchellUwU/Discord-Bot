import Event from '../../classes/Event';

export default new Event('disconnect', false, async (client) => {
	client.utils.logger({ title: 'Disconnect', content: 'Client disconnected', type: 2 });
});
