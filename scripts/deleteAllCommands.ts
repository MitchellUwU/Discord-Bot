import { Client, ClientOptions } from 'oceanic.js';
import options from '../config.json';

const client = new Client(options.clientOptions as ClientOptions);

client.once('ready', () => {
	try {
		if (options.devMode) {
			client.application.bulkEditGuildCommands(options.guildID, []);
			console.log('Deleting all guild commands...');
			setTimeout(() => {
				console.log('Deleted all guild commands.');
				client.disconnect(false);
				process.exit();
			}, 10000);
		} else {
			client.application.bulkEditGlobalCommands([]);
			console.log('Deleting all global commands...');
			setTimeout(() => {
				console.log('Deleted all global commands.');
				client.disconnect(false);
				process.exit();
			}, 10000);
		}
	} catch (error) {
		console.log('Error:', error);
	}
});

client.connect();
