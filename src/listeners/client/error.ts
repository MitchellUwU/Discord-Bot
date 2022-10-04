import BotClient from '../../client';
import Builders from '../../utils/builders';
import Event from '../../interfaces/event';

export default class ErrorEvent extends Event<'error'> {
	public override data = new Builders.Event('error', false).toJSON();

	public async execute(client: BotClient, error: any): Promise<void> {
		const ignoredErrorCodes = [1001, 1006, 'ECONNRESET'];

		if (ignoredErrorCodes.includes(error.code)) return;

		client.utils.logger({ title: 'Error', content: error.stack, type: 2 });
	}
}
