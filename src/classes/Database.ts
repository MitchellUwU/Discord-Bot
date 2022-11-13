import config from '../../config.json';
import BotClient from './Client';
import { Pool, QueryResult } from 'pg';

// Database manager.

export default class Database {
	private client: BotClient;
	pool: Pool;
	constructor(client: BotClient) {
		this.client = client;
		this.pool = new Pool(config.db);
		this.client.utils.logger({
			title: 'Database',
			content: 'Connected to PostgreSQL database!',
			type: 1,
		});
	}

	/**
	 * Query the database.
	 * @param text String to query.
	 * @param params Extra parameters.
	 * @param callback Callback function.
	 * @returns Promise<void>
	 */

	async query(text: string, params: any, callback: (err: Error, result: QueryResult) => void) {
		return this.pool.query(text, params, (error, res) => {
			callback(error, res);
		});
	}
}
