'use strict';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { logger, listen } from './utils.js';
import { } from 'dotenv/config';
import { join } from 'path';

import login from '@xaviabot/fca-unofficial';
import loadClient from './client/index.js';
import server from './src/server/server.js';


const { APPSTATE_PATH, APPSTATE_SECRET_KEY } = process.env;

//handledPromiseRejectionWarning
process.on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
})

async function start() {
    try {
        client = await loadClient();
        logger.system(getLang('system.start.clientLoaded'));

        await server(process.env.PORT, client.db);
        await booting(logger);
    } catch (err) {
        logger.error(err);
        return process.exit(0);
    }
}

function booting(logger) {
    return new Promise((resolve, reject) => {

        logger.custom('Logging in...', 'LOGIN');

        loginState()
            .then(api => {
                botID = api.getCurrentUserID();
                logger.custom(`Logged in - ${botID}`, 'LOGIN');

                const db = client.db;
                delete client.db;

                refreshState(api);
                client.config.REFRESH ? autoReloadApplication() : null;
                resolve(api.listenMqtt(listen(api, db)));
            })
            .catch(err => {
                reject(err);
            })
    });
}

function refreshState(api) {
    const _2HOUR = 1000 * 60 * 60 * 2;
    setInterval(() => {
        logger.custom('Refreshing Cookies...', 'REFRESH');
        const newAppState = api.getAppState();
        const encryptedAppState = client.modules.aes.encrypt(JSON.stringify(newAppState), APPSTATE_SECRET_KEY);
        writeFileSync(join(process.cwd(), '../', APPSTATE_PATH), encryptedAppState);
    }, _2HOUR);
}

function autoReloadApplication() {
    setTimeout(() => process.exit(1), client.config.REFRESH);
}

function loginState() {
    return new Promise((resolve, reject) => {
        client.modules.checkAppstate(APPSTATE_PATH, APPSTATE_SECRET_KEY, { readFileSync, writeFileSync, existsSync })
            .then(appState => {
                const options = client.config.FCA_OPTIONS;

                login({ appState }, options, (error, api) => {
                    if (error) {
                        reject(error.error || error);
                    }
                    resolve(api);
                });
            })
            .catch(err => {
                reject(err);
            });
    });
}

start();
