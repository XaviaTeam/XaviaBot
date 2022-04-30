'use strict';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import login from '@xaviabot/fca-unofficial';
import loadClient from './client/index.js';
import { logger, listen } from './utils.js';
import express from 'express';
import { } from 'dotenv/config';


const { APPSTATE_PATH, APPSTATE_SECRET_KEY } = process.env;

//handledPromiseRejectionWarning
process.on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
})

function openServer() {
    const app = express();

    //OPEN DASHBOARD SERVER
    const port = process.env.PORT || 3000;
    let html_string = "<!DOCTYPE html>\n<html lang=\"en\">\n\n<head>\n    <meta charset=\"UTF-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Dashboard</title>\n    <style>\n        body {\n            background-color: #7e6de0;\n        }\n\n        .container {\n            position: fixed;\n            width: 90%;\n            height: 90%;\n            top: 50%;\n            left: 50%;\n            -webkit-transform: translate(-50%, -50%);\n            transform: translate(-50%, -50%);\n            background-color: rgb(45, 118, 226);\n            border-radius: 25px;\n        }\n\n        .div_title {\n            position: absolute;\n            top: 30%;\n            left: 50%;\n            -webkit-transform: translate(-50%, -50%);\n            transform: translate(-50%, -50%);\n            color: rgb(63, 57, 57);\n            font-size: 50px;\n            font-weight: bold;\n            text-align: center;\n        }\n\n        .uptime {\n            position: absolute;\n            top: 50%;\n            left: 50%;\n            -webkit-transform: translate(-50%, -50%);\n            transform: translate(-50%, -50%);\n            color: white;\n            font-size: 50px;\n            font-weight: bold;\n            text-align: center;\n        }\n    </style>\n</head>\n\n<body>\n    <div class=\"container\">\n        <div class=\"div_title\">Dashboard</div>\n        <div class=\"uptime\">00:00:00</div>\n    </div>\n</body>\n<script>\n    const uptimeClass = 'uptime';\n    const uptime = document.getElementsByClassName(uptimeClass);\n    let time = 'replace_me';\n\n    const secondToTime = (seconds) => {\n        if (isNaN(seconds)) seconds = 0;\n        const hours = Math.floor(seconds / 3600);\n        const minutes = Math.floor((seconds - (hours * 3600)) / 60);\n        const sec = seconds - (hours * 3600) - (minutes * 60);\n        return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${sec < 10 ? '0' + sec : sec}`;\n    }\n\n    setInterval(() => {\n        time++;\n        uptime[0].innerHTML = secondToTime(time);\n    }, 1000);\n</script>\n\n</html>";

    app.use('/', (req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.send(html_string.replace("'replace_me'", Math.floor(process.uptime())));
    });

    app.listen(port, () => {
        logger.system(`Xavia is running on port ${port}`);
        start();
    });
}

async function start() {
    try {
        client = await loadClient();

        logger.system('Client Loaded');
        logger.system('Booting up...');

        await booting(logger);
    } catch (err) {
        console.error(err);
        return process.exit(0);
    }
}

function booting(logger) {
    return new Promise((resolve, reject) => {

        logger.custom('Logging in...', 'LOGIN');

        loginState()
            .then(api => {
                botID = api.getCurrentUserID();
                logger.custom(`Logged in as ${botID}`, 'LOGIN');

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
        const newAppState = api.getAppState();
        const encryptedAppState = client.modules.aes.encrypt(JSON.stringify(newAppState), APPSTATE_SECRET_KEY);
        writeFileSync(APPSTATE_PATH, encryptedAppState);
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

openServer();
