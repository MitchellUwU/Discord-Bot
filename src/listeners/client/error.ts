import BotClient from '../../client';
import Builders from '../../utils/builders';
import Event from '../../interfaces/event';
import { ExecuteReturnType } from '../../types/additional';

export default class ErrorEvent extends Event<'error'> {
	public override data = new Builders.Event('error', false).toJSON();

	public async execute(client: BotClient, error: Error | string): ExecuteReturnType {
		client.utils.logger({ title: 'Error', content: error, type: 2 });
	}
}
