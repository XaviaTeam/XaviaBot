import { resolve } from "path";
import { writeFileSync, readFileSync, unlinkSync, readdirSync } from "fs";
import Threads from "../var/controllers/thread.js";
import Users from "../var/controllers/user.js";

import mongoose from "mongoose";
import models from "../var/models/index.js";

var _Threads;
var _Users;

function saveFile(path, data) {
    writeFileSync(path, data, 'utf8');
}

async function initDatabase() {
    _Threads = Threads();
    _Users = Users();

    const logger = global.modules.get('logger');
    const { DATABASE } = global.config;
    const dataPath = resolve(process.cwd(), "core", "var", "data");
    const cachePath = global.cachePath;

    if (!global.isExists(dataPath, 'dir')) {
        global.createDir(dataPath);
    }

    if (!global.isExists(cachePath, 'dir')) {
        global.createDir(cachePath);
    }

    if (DATABASE === 'JSON') {
        let threadPath = resolve(dataPath, "threads.json");
        let userPath = resolve(dataPath, "users.json");


        if (!global.isExists(threadPath, 'file')) {
            saveFile(threadPath, "{}");
        } else {
            global.data.threads = new Map(Object.entries(JSON.parse(readFileSync(threadPath, 'utf8'))));
        }

        if (!global.isExists(userPath, 'file')) {
            saveFile(userPath, "{}");
        } else {
            global.data.users = new Map(Object.entries(JSON.parse(readFileSync(userPath, 'utf8'))));
        }
    } else if (DATABASE === 'MONGO') {
        const { MONGO_URL } = process.env;
        if (!MONGO_URL) throw new Error(global.getLang('database.mongo_url_not_found'));

        mongoose.set('strictQuery', false);
        let mongooseConnection = async () => {
            await mongoose.connect(MONGO_URL);
            return mongoose.connection;
        }

        let connection = await mongooseConnection();

        global.mongo = connection;
        global.data.models = models;

        const threads = await models.Threads.find({});
        const users = await models.Users.find({});

        for (const thread of threads) {
            global.data.threads.set(thread.threadID, thread);
        }

        for (const user of users) {
            global.data.users.set(user.userID, user);
        }
    }

    logger.custom(global.getLang(`database.init`, { database: DATABASE }), 'DATABASE');
}

function mapToObj(map) {
    const obj = {};
    for (const [key, value] of map.entries()) {
        obj[key] = value;
    }
    return obj;
}

function updateJSON() {
    const { threads, users } = global.data;
    const { DATABASE_JSON_BEAUTIFY } = global.config;

    const formatData = data => DATABASE_JSON_BEAUTIFY ? JSON.stringify(data, null, 4) : JSON.stringify(data);

    saveFile(resolve(process.cwd(), "core", "var", "data", "threads.bak.json"), JSON.stringify(mapToObj(threads)));
    saveFile(resolve(process.cwd(), "core", "var", "data", "threads.json"), formatData(mapToObj(threads)));
    unlinkSync(resolve(process.cwd(), "core", "var", "data", "threads.bak.json"));


    saveFile(resolve(process.cwd(), "core", "var", "data", "users.bak.json"), JSON.stringify(mapToObj(users)));
    saveFile(resolve(process.cwd(), "core", "var", "data", "users.json"), formatData(mapToObj(users)));
    unlinkSync(resolve(process.cwd(), "core", "var", "data", "users.bak.json"));
}

async function updateMONGO() {
    const { threads, users } = global.data;
    const { models } = global.data;
    try {
        for (const [key, value] of threads.entries()) {
            await models.Threads.findOneAndUpdate({ threadID: key }, value, { upsert: true });
        }

        for (const [key, value] of users.entries()) {
            await models.Users.findOneAndUpdate({ userID: key }, value, { upsert: true });
        }
    } catch (e) {
        throw new Error(e);
    }
}

async function handleDatabase(event) {
    const logger = global.modules.get('logger');
    const { senderID, userID, threadID } = event;

    const targetID = userID || senderID;
    try {
        if (event.isGroup === true && !global.data.threads.has(threadID)) {
            await _Threads.get(threadID);
        }
        if (!global.data.users.has(targetID)) {
            await _Users.get(targetID);
        }
    } catch (e) {
        console.error(e);
        logger.custom(global.getLang(`database.error`, { error: String(e.message || e) }), 'DATABASE');
    }
}

export {
    initDatabase,
    updateJSON,
    updateMONGO,
    handleDatabase,
    _Threads,
    _Users
};
