import BotClient from './client';
import config from '../config.json';

// Print super duper epic ASCII art.
console.log(config.ascii.join('\n'));

export const client = new BotClient(config); // Initialize the client.

// Start the client.
client.start();

/**
 * Start listening to process events.
 * @event Exit Handle exit code.
 * @event UnhandledRejection Handle promise rejection.
 * @event UncaughtException Handle uncaught exception.
 * @event SIGINT Handle SIGINT signal.
 * @event SIGTERM Handle SIGTERM signal.
 */

process.on('exit', (code: Number): void => {
	client.utils.logger({ title: 'Exit', content: `Exited with code ${code}`, type: 3 });
});

process.on('unhandledRejection', (reason: Error): void => {
	client.utils.logger({ title: 'UnhandledRejection', content: reason.stack, type: 3 });
});

process.on('uncaughtException', (error: Error): void => {
	client.utils.logger({ title: 'UncaughtException', content: error.stack, type: 3 });
	client.onMaintenance = true;
});

process.on('SIGINT', (): void => {
	client.utils.logger({ title: 'SIGINT', content: 'Received SIGINT, Shutting down', type: 3 });
	client.shutdown();
});

process.on('SIGTERM', (): void => {
	client.utils.logger({ title: 'SIGTERM', content: 'Received SIGTERM, Shutting down', type: 3 });
	client.shutdown();
});
