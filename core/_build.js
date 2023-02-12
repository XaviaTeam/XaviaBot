import '../cleanup.js';

import { } from 'dotenv/config';
import { writeFileSync } from 'fs';
import { resolve as resolvePath } from 'path';
import logger from './var/modules/logger.js';

import login from '@xaviabot/fca-unofficial';
import startServer from './dashboard/server/app.js';
import handleListen from './handlers/listen.js';
import environments from './var/modules/environments.get.js';
import _init_var from './var/_init.js';

import replitDB from "@replit/database";
import { execSync } from 'child_process';
import { initDatabase, updateJSON, updateMONGO, _Threads, _Users } from './handlers/database.js';

const { isGlitch, isReplit } = environments;

process.stdout.write(
    String.fromCharCode(27) + "]0;" + "Xavia" + String.fromCharCode(7)
);

process.on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
});

process.on('uncaughtException', (err, origin) => {
    logger.error("Uncaught Exception: " + err + ": " + origin);
});

process.on('SIGINT', () => {
    logger.system(getLang('build.start.exit'));
    global.shutdown();
});

process.on('SIGTERM', () => {
    logger.system(getLang('build.start.exit'));
    global.shutdown();
});

process.on('SIGHUP', () => {
    logger.system(getLang('build.start.exit'));
    global.shutdown();
});

async function start() {
    try {
        await _init_var();

        logger.system(getLang('build.start.varLoaded'));
        await initDatabase();
        global.updateJSON = updateJSON;
        global.updateMONGO = updateMONGO;
        global.controllers = {
            Threads: _Threads,
            Users: _Users
        }

        const serverAdminPassword = getRandomPassword(8);
        startServer(serverAdminPassword);

        process.env.SERVER_ADMIN_PASSWORD = serverAdminPassword;

        await booting(logger);
    } catch (err) {
        logger.error(err);
        return global.shutdown();
    }
}

function booting(logger) {
    return new Promise((resolve, reject) => {

        logger.custom(getLang('build.booting.logging'), 'LOGIN');

        loginState()
            .then(async api => {
                global.api = api;
                global.botID = api.getCurrentUserID();
                logger.custom(getLang('build.booting.logged', { botID }), 'LOGIN');

                refreshState();;
                global.config.REFRESH ? autoReloadApplication() : null;
                global.listenMqtt = api.listenMqtt(await handleListen());
                refreshMqtt();

                resolve();
            })
            .catch(err => {
                if (isGlitch && global.isExists(resolvePath(process.cwd(), '.data', 'appstate.json'), 'file')) {
                    global.deleteFile(resolvePath(process.cwd(), '.data', 'appstate.json'));
                    execSync('refresh');
                }
                reject(err);
            })
    });
}

const _12HOUR = 1000 * 60 * 60 * 12;
const _2HOUR = 1000 * 60 * 60 * 2;
function refreshState() {
    global.refreshState = setInterval(() => {
        logger.custom(getLang('build.refreshState'), 'REFRESH');
        const newAppState = global.api.getAppState();
        if (global.config.APPSTATE_PROTECTION === true) {
            if (isGlitch) {
                writeFileSync(resolvePath(process.cwd(), '.data', 'appstate.json'), JSON.stringify(newAppState, null, 2), 'utf-8');
            } else if (isReplit) {
                let APPSTATE_SECRET_KEY;
                let db = new replitDB();
                db.get("APPSTATE_SECRET_KEY")
                    .then(value => {
                        if (value !== null) {
                            APPSTATE_SECRET_KEY = value;
                            const encryptedAppState = global.modules.get('aes').encrypt(JSON.stringify(newAppState), APPSTATE_SECRET_KEY);
                            writeFileSync(resolvePath(global.config.APPSTATE_PATH), JSON.stringify(encryptedAppState), 'utf8');
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    });
            }
        } else {
            writeFileSync(resolvePath(global.config.APPSTATE_PATH), JSON.stringify(newAppState, null, 2), 'utf8');
        }
    }, _12HOUR);
}

function refreshMqtt() {
    global.refreshMqtt = setInterval(async () => {
        logger.custom(getLang('build.refreshMqtt'), 'REFRESH');
        global.listenMqtt.stopListening();
        global.listenMqtt = global.api.listenMqtt(await handleListen());
    }, _2HOUR);
}

function autoReloadApplication() {
    setTimeout(() => global.restart(), global.config.REFRESH);
}

function loginState() {
    const { APPSTATE_PATH, APPSTATE_PROTECTION } = global.config;

    return new Promise((resolve, reject) => {
        global.modules.get('checkAppstate')(APPSTATE_PATH, APPSTATE_PROTECTION)
            .then(appState => {
                const options = global.config.FCA_OPTIONS;

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
