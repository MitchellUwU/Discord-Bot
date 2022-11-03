import BotClient from '../../classes/Client';
import Builders from '../../classes/Builders';
import Event from '../../classes/Event';
import { ExecuteReturnType } from '../../types/additional';

export default class DisconnectEvent extends Event<'disconnect'> {
	public override data = new Builders.Event('disconnect', false).toJSON();

	public async execute(client: BotClient): ExecuteReturnType {
		client.utils.logger({ title: 'Disconnect', content: 'Client disconnected', type: 2 });
	}
}
