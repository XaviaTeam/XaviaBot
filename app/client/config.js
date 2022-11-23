import config from '../../config/index.js';
import database from '../src/database/index.js';

export default function () {
    return new Promise(async (resolve) => {
        client.config = config;

        client.modules.logger.system(getLang('client.config.loaded'));

        const db = new database(config.DATABASE_SETTINGS);

        db.backup()
            .catch(error => {
                client.modules.logger.error(error);
                client.modules.logger.error(getLang('database.error.backupFailed'));
                db.restore()
                    .catch(error => {
                        client.modules.logger.error(error);
                        client.modules.logger.error(getLang('database.error.restoreFailed'));
                    })
            });
        client.db = db;

        resolve();
    });
}
