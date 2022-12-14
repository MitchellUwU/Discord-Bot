import type { ClientOptions } from 'oceanic.js';
import BotClient from './classes/Client';
import config from '../config.json';

// Print super duper epic ASCII art.
console.log(config.ascii.join('\n'));

export const client = new BotClient(config.clientOptions as ClientOptions); // Initialize the client.

// Run the client.
client.run();

/**
 * Start listening to process events.
 * @event Exit Handle exit code.
 * @event UnhandledRejection Handle promise rejection.
 * @event UncaughtException Handle uncaught exception.
 * @event SIGINT Handle SIGINT signal.
 * @event SIGTERM Handle SIGTERM signal.
 */

process.on('exit', (code) => {
	client.utils.logger({ title: 'Exit', content: `Exited with code ${code}`, type: 3 });
});

process.on('unhandledRejection', (reason) => {
	client.utils.logger({
		title: 'UnhandledRejection',
		content: reason instanceof Error ? reason.stack : reason,
		type: 2,
	});
});

process.on('uncaughtException', (error) => {
	client.utils.logger({ title: 'UncaughtException', content: error.stack, type: 2 });
});

process.on('SIGINT', () => {
	client.utils.logger({ title: 'SIGINT', content: 'Received SIGINT, Shutting down', type: 3 });
	client.shutdown();
});

process.on('SIGTERM', () => {
	client.utils.logger({ title: 'SIGTERM', content: 'Received SIGTERM, Shutting down', type: 3 });
	client.shutdown();
});
