import Event from '../../classes/Event';

export default new Event('ready', true, async (client) => {
	client.utils.logger({ title: 'Ready', content: 'Client is ready!', type: 1 });
});
