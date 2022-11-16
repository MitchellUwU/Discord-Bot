import Event from '../../classes/Event';

export default new Event('error', false, async (client, error) => {
	client.utils.logger({ title: 'Error', content: typeof error === 'string' ? error : error.stack, type: 2 });
});
