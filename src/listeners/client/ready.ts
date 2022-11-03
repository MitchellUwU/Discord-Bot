import BotClient from '../../classes/Client';
import Builders from '../../classes/Builders';
import Event from '../../classes/Event';
import { ExecuteReturnType } from '../../types/additional';

export default class ReadyEvent extends Event<'ready'> {
	public override data = new Builders.Event('ready', true).toJSON();

	public async execute(client: BotClient): ExecuteReturnType {
		client.utils.logger({ title: 'Ready', content: 'Client is ready!', type: 1 });
	}
}
