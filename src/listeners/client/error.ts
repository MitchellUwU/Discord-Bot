import Event from '../../classes/Event';

export default new Event('error', false, async (client, error) => {
	client.utils.logger({ title: 'Error', content: error, type: 2 });
});
