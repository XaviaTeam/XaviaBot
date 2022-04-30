import config from '../../config/index.js';
import database from '../src/database/index.js';

export default function (client) {
    return new Promise(async (resolve, reject) => {
        client.config = config;
        client.modules.logger.system('Config loaded');

        client.modules.logger.custom('Connecting to database...', 'DATABASE');
        const db = new database(config.DATABASE_SETTINGS);
        try {
            db.authenticate();
        } catch (err) {
            reject(err);
        }

        client.db = db;

        resolve(client);
    });
}
