import { Client } from 'oceanic.js';
import options from '../config.json';

const client = new Client(options.clientOptions);

client.once('ready', () => {
	try {
		if (options.devMode) {
			client.application.bulkEditGuildCommands(options.guildID, []);
			console.log('deleting all guild commands...');
			setTimeout(() => {
				console.log('deleted all guild commands!');
				client.disconnect(false);
				process.exit();
			}, 30000);
		} else {
			client.application.bulkEditGlobalCommands([]);
			console.log('deleting all global commands...');
			setTimeout(() => {
				console.log('deleted all global commands!');
				client.disconnect(false);
				process.exit();
			}, 30000);
		}
	} catch (error: any) {
		console.log(`can't delete commands! error: ${error.stack}`);
	}
});

client.connect();
