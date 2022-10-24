import config from '../../config.json';
import BotClient from '../client';
import { Pool, QueryResult } from 'pg';

const pool = new Pool(config.db);

// Database manager.

export default class Database {
	private client: BotClient; // [INTERNAL] The main client.

	/**
	 * Database Manager constructor.
	 * @param client The main client.
	 */

	public constructor(client: BotClient) {
		this.client = client;

		this.client.utils.logger({
			title: 'Database',
			content: 'Connected to PostgreSQL database!',
			type: 1,
		});
	}

	/**
	 * Query the database.
	 * @param text Anything.
	 * @param params [OPTIONAL] Anything.
	 * @param callback [OPTIONAL] Anything.
	 * @returns Promise<void>
	 */

	public async query(text: string, params: any, callback: (err: Error, result: QueryResult) => void): Promise<void> {
		return pool.query(text, params, (error, res) => {
			callback(error, res);
		});
	}
}
