import { readFileSync, writeFileSync } from 'fs';
import { logger, listen } from './utils.js';
import { } from 'dotenv/config';
import { resolve as resolvePath } from 'path';

import login from '@xaviabot/fca-unofficial';
import loadClient from './client/index.js';
import server from './src/server/index.js';

import { createInterface, clearLine, cursorTo } from 'readline';
import CLI from './src/CLI/index.js';

const { APPSTATE_PATH, APPSTATE_SECRET_KEY } = process.env;


process.on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
})

async function start() {
    try {
        await loadClient();
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
                startCLI(api);
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
        writeFileSync(resolvePath(APPSTATE_PATH), JSON.stringify(encryptedAppState), 'utf8');
    }, _2HOUR);
}

function startCLI(api) {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });
    global.console = console;
    const oldLog = console.log;
    const oldErrLog = console.error;
    console.log = input => {
        cursorTo(process.stdout, 0);
        clearLine(process.stdout, 0);
        oldLog(input);
        rl.prompt();
    }
    console.error = input => {
        cursorTo(process.stdout, 0);
        clearLine(process.stdout, 0);
        oldErrLog(input);
        rl.prompt();
    }

    rl.on('line', function (line) {
        const args = line.split(' ');
        const command = args.shift();
        const input = args.join(' ');

        const checkCLI = CLI(command);
        if (checkCLI) {
            checkCLI.execute({ api, input });
        } else {
            logger.error(getLang('system.cli.commandNotFound', { commandName: command }));
        }
    }).on('close', function () {
        process.exit(0);
    });

    rl.setPrompt(`[${client.config.PREFIX}]${client.config.NAME}@Xaviabot:~$ `);
    rl.prompt();
}

function autoReloadApplication() {
    setTimeout(() => process.exit(1), client.config.REFRESH);
}

function loginState() {
    return new Promise((resolve, reject) => {
        client.modules.checkAppstate(APPSTATE_PATH, APPSTATE_SECRET_KEY, { readFileSync, writeFileSync, resolvePath })
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
