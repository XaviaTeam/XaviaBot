import "../cleanup.js";

import {} from "dotenv/config";
import { writeFileSync } from "fs";
import { resolve as resolvePath } from "path";
import logger from "./var/modules/logger.js";

import login from "@xaviabot/fca-unofficial";
import startServer from "./dashboard/server/app.js";
import handleListen from "./handlers/listen.js";
import { isGlitch, isReplit } from "./var/modules/environments.get.js";
import initializeVar from "./var/_init.js";
import { getLang, loadPlugins } from "./var/modules/loader.js";

import * as aes from "./var/modules/aes.js";

import { checkAppstate } from "./var/modules/checkAppstate.js";

import replitDB from "@replit/database";
import { execSync } from "child_process";
import { XDatabase } from "./handlers/database.js";
import { Assets } from "./handlers/assets.js";

import crypto from "crypto";

process.stdout.write(String.fromCharCode(27) + "]0;" + "Xavia" + String.fromCharCode(7));

process.on("unhandledRejection", (reason, p) => {
    console.error(reason, "Unhandled Rejection at Promise", p);
});

process.on("uncaughtException", (err, origin) => {
    logger.error("Uncaught Exception: " + err + ": " + origin);
});

process.on("SIGINT", () => {
    logger.system(getLang("build.start.exit"));
    global.shutdown();
});

process.on("SIGTERM", () => {
    logger.system(getLang("build.start.exit"));
    global.shutdown();
});

process.on("SIGHUP", () => {
    logger.system(getLang("build.start.exit"));
    global.shutdown();
});

await initializeVar();

async function start() {
    try {
        console.clear();
        logger.system(getLang("build.start.varLoaded"));
        logger.custom(getLang("build.start.logging"), "LOGIN");

        const api = await loginState();
        global.api = api;
        global.botID = api.getCurrentUserID();

        logger.custom(getLang("build.start.logged", { botID }), "LOGIN");

        console.log();
        const xDatabase = new XDatabase(api, global.config.DATABASE);
        await xDatabase.init();
        console.log();

        new Assets();
        logger.custom(getLang("build.start.plugin.loading"), "LOADER");
        await loadPlugins(xDatabase);

        const serverAdminPassword = getRandomPassword(8);
        startServer(serverAdminPassword);

        process.env.SERVER_ADMIN_PASSWORD = serverAdminPassword;

        await booting(api, xDatabase);
    } catch (err) {
        logger.error(err);
        return global.shutdown();
    }
}

global.listenerID = null;

/**
 * @param {import("@xaviabot/fca-unofficial").IFCAU_API} api
 * @param {xDatabase} xDatabase
 */
async function booting(api, xDatabase) {
    try {
        global.controllers = {
            Threads: xDatabase.threads,
            Users: xDatabase.users,
        };

        refreshState();
        const refreshDelay = parseInt(global.config.REFRESH);
        if (refreshDelay > 0) autoReloadApplication(refreshDelay);

        const newListenerID = generateListenerID();
        global.listenerID = newListenerID;
        global.listenMqtt = api.listenMqtt(await handleListen(newListenerID, xDatabase));

        refreshMqtt(xDatabase);
    } catch (error) {
        const glitchAppstatePath = resolvePath(process.cwd(), ".data", "appstate.json");

        if (isGlitch && global.isExists(glitchAppstatePath, "file")) {
            global.deleteFile(glitchAppstatePath);
            execSync("refresh");
        }

        throw error;
    }
}

const _12HOUR = 1000 * 60 * 60 * 12;
const _2HOUR = 1000 * 60 * 60 * 2;
function refreshState() {
    global.refreshState = setInterval(() => {
        logger.custom(getLang("build.refreshState"), "REFRESH");
        const newAppState = global.api.getAppState();
        if (global.config.APPSTATE_PROTECTION === true) {
            if (isGlitch) {
                writeFileSync(
                    resolvePath(process.cwd(), ".data", "appstate.json"),
                    JSON.stringify(newAppState, null, 2),
                    "utf-8"
                );
            } else if (isReplit) {
                let APPSTATE_SECRET_KEY;
                let db = new replitDB();
                db.get("APPSTATE_SECRET_KEY")
                    .then((value) => {
                        if (value !== null) {
                            APPSTATE_SECRET_KEY = value;
                            const encryptedAppState = aes.encrypt(
                                JSON.stringify(newAppState),
                                APPSTATE_SECRET_KEY
                            );
                            writeFileSync(
                                resolvePath(global.config.APPSTATE_PATH),
                                JSON.stringify(encryptedAppState),
                                "utf8"
                            );
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            }
        } else {
            writeFileSync(
                resolvePath(global.config.APPSTATE_PATH),
                JSON.stringify(newAppState, null, 2),
                "utf8"
            );
        }
    }, _12HOUR);
}

/**
 *
 * @param {xDatabase} xDatabase
 */
function refreshMqtt(xDatabase) {
    global.refreshMqtt = setInterval(async () => {
        logger.custom(getLang("build.refreshMqtt"), "REFRESH");
        const newListenerID = generateListenerID();
        global.listenMqtt.stopListening();
        global.listenerID = newListenerID;
        global.listenMqtt = global.api.listenMqtt(await handleListen(newListenerID, xDatabase));
    }, _2HOUR);
}

function generateListenerID() {
    return Date.now() + crypto.randomBytes(4).toString("hex");
}

function autoReloadApplication(refreshDelay) {
    setTimeout(() => global.restart(), refreshDelay);
}

async function loginState() {
    const appState = await checkAppstate(
        global.config.APPSTATE_PATH,
        global.config.APPSTATE_PROTECTION
    );

    const options = global.config.FCA_OPTIONS;

    return await login({ appState }, options);
}

start();
