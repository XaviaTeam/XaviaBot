import { resolve } from "path";
import { writeFileSync, readFileSync, unlinkSync, readdirSync } from "fs";
import getCThread from "../var/controllers/thread.js";
import getCUser from "../var/controllers/user.js";

import logger from "../var/modules/logger.js";

import { isExists, createDir, isJSON } from "../var/utils.js";

import { resolve as resolvePath } from "path";

import mongoose from "mongoose";
import models from "../var/models/index.js";

import { effects } from "../var/_global_info.js";

async function handleDatabase(event) {
    const { senderID, userID, threadID } = event;
    const { Threads, Users } = global.controllers;

    const targetID = userID || senderID;
    try {
        if (event.isGroup === true && !global.data.threads.has(threadID)) {
            await Threads.get(threadID);
        }
        if (!global.data.users.has(targetID)) {
            await Users.get(targetID);
        }
    } catch (e) {
        console.error(e);
        logger.custom(
            global.getLang(`database.error`, { error: String(e.message || e) }),
            "DATABASE"
        );
    }
}

export class XDatabase {
    #dataPath = resolve(process.cwd(), "core", "var", "data");
    #tPath = resolve(process.cwd(), "core", "var", "data", "t_img");
    #cachePath = resolvePath(process.cwd(), "core", "var", "data", "cache");

    #api;

    #threads;
    #users;
    #effects;

    /** @type {"JSON" | "MONGO"} */
    #database = "JSON";

    /** @type {mongoose.Connection} */
    #mongoConnection;

    #models = models;

    /**
     * @param {import("@xaviabot/fca-unofficial").IFCAU_API} api
     * @param {"JSON" | "MONGO"} database
     */
    constructor(api, database = "JSON") {
        this.#api = api;
        this.#database = database;
        if (database != "JSON" && database != "MONGO") {
            logger.warn(`Database ${database} is invalid, fallback to JSON`);
            this.#database = "JSON";
        }

        this.#threads = getCThread(this, this.#api);
        this.#users = getCUser(this, this.#api);
        this.#effects = effects;
    }

    async init() {
        logger.custom(global.getLang(`database.init`, { database: this.#database }), "DATABASE");

        this.#ensureNecessaryFoldersExist([this.#dataPath, this.#cachePath, this.#tPath]);
        this.#handleJSONDB(["threads.json", "users.json", "effects.json"]);

        await this.#handleMongoDB();

        logger.custom(global.getLang(`database.init.done`, { database: this.#database }), "DATABASE");
    }

    #updateJSON() {
        logger.custom(global.getLang("database.updating", { database: "JSON" }), "JSON-DB");

        const threads = this.threads.getAll();
        const users = this.users.getAll();

        let now = Date.now();
        const start = now;
        const { DATABASE_JSON_BEAUTIFY } = global.config;

        const formatData = (data, isBak = false) =>
            JSON.stringify(data, (k, v) => {
                if (typeof v == "bigint") return v.toString();

                return v;
            }, DATABASE_JSON_BEAUTIFY && !isBak ? 4 : 0);

        this.#saveFile(
            resolve(process.cwd(), "core", "var", "data", "threads.bak.json"),
            formatData(threads, true)
        );
        this.#saveFile(
            resolve(process.cwd(), "core", "var", "data", "threads.json"),
            formatData(threads)
        );
        unlinkSync(resolve(process.cwd(), "core", "var", "data", "threads.bak.json"));
        logger.custom(`THREAD DATA UPDATED: ${Date.now() - now}ms`, "JSON-DB");
        now = Date.now();

        this.#saveFile(
            resolve(process.cwd(), "core", "var", "data", "users.bak.json"),
            formatData(users, true)
        );
        this.#saveFile(
            resolve(process.cwd(), "core", "var", "data", "users.json"),
            formatData(users)
        );
        unlinkSync(resolve(process.cwd(), "core", "var", "data", "users.bak.json"));
        logger.custom(`USER DATA UPDATED: ${Date.now() - now}ms`, "JSON-DB");
        now = Date.now();

        this.#saveFile(
            resolve(process.cwd(), "core", "var", "data", "effects.bak.json"),
            formatData(effects.values(), true)
        );
        this.#saveFile(
            resolve(process.cwd(), "core", "var", "data", "effects.json"),
            formatData(effects.values())
        );
        unlinkSync(resolve(process.cwd(), "core", "var", "data", "effects.bak.json"));
        logger.custom(`EFFECT DATA UPDATED: ${Date.now() - now}ms`, "JSON-DB");
        now = Date.now();

        const total = Date.now() - start;
        logger.custom(`FINISHED UPDATING: ${total}ms`, "JSON-DB");
    }

    async #updateMONGO() {
        logger.custom(global.getLang("database.updating", { database: "MONGO" }), "MONGO-DB");

        const threads = this.threads.getAll();
        const users = this.users.getAll();

        try {
            const ignoreList = ["_id", "__v", "createdAt"];

            let now = Date.now();
            const start = now;

            const bulkOps = [];

            for (const thread of threads) {
                ignoreList.forEach((e) => {
                    delete thread[e];
                });

                thread.updatedAt = Date.now();

                bulkOps.push({
                    replaceOne: {
                        filter: { threadID: thread.threadID },
                        replacement: thread,
                        upsert: true,
                    },
                });
            }

            await models.Threads.bulkWrite(bulkOps, { ordered: false });

            logger.custom(`THREAD DATA UPDATED: ${Date.now() - now}ms`, "MONGO-DB");

            bulkOps.length = 0;
            now = Date.now();

            for (const user of users) {
                ignoreList.forEach((e) => {
                    delete user[e];
                });

                user.updatedAt = Date.now();

                bulkOps.push({
                    replaceOne: {
                        filter: { userID: user.userID },
                        replacement: user,
                        upsert: true,
                    },
                });
            }

            await models.Users.bulkWrite(bulkOps, { ordered: false });

            logger.custom(`USER DATA UPDATED: ${Date.now() - now}ms`, "MONGO-DB");

            bulkOps.length = 0;
            now = Date.now();

            for (const effect of effects.values()) {
                ignoreList.forEach((e) => {
                    delete effect[e];
                });

                effect.updatedAt = Date.now();

                bulkOps.push({
                    replaceOne: {
                        filter: { pluginName: effect.pluginName },
                        replacement: effect,
                        upsert: true,
                    },
                });
            }

            await models.Effects.bulkWrite(bulkOps, { ordered: false });

            logger.custom(`EFFECT DATA UPDATED: ${Date.now() - now}ms`, "MONGO-DB");

            const total = Date.now() - start;
            logger.custom(`FINISHED UPDATING: ${total}ms`, "MONGO-DB");
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * @param {string[]} paths
     */
    #ensureNecessaryFoldersExist(paths) {
        for (const path of paths) {
            if (!isExists(path, "dir")) {
                createDir(path);
            }
        }
    }

    /**
     * @param {string[]} filenames - name of files that stored in the data path
     */
    #handleJSONDB(filenames) {
        if (this.#database == "MONGO") return;

        for (const filename of filenames) {
            const filePath = resolve(this.#dataPath, filename);

            if (!isExists(filePath, "file")) {
                this.#saveFile(filePath, "[]");
            } else {
                const jsonStringData = readFileSync(filePath, "utf8");
                const isValidJSON = isJSON(jsonStringData);

                if (!isValidJSON) {
                    logger.warn(`${filename} corrupted, resetting...`);
                    this.#saveFile(filePath, "[]");
                }

                let parsedData = JSON.parse(isValidJSON ? jsonStringData : "[]");

                if (!Array.isArray(parsedData)) {
                    logger.warn(`${filename} - object based is deprecated, converting...`);

                    parsedData = Object.values(parsedData);
                }

                // global data will be deprecated soon
                if (filename == "threads.json") {
                    for (const tData of parsedData) {
                        // backward compatibility for old data
                        if (tData.info.hasOwnProperty("adminIDs")) {
                            tData.info.adminIDs = tData.info.adminIDs.map((e) => e?.id || e);
                        }

                        global.data.threads.set(tData.threadID, tData, true);
                    }
                } else if (filename == "users.json") {
                    for (const uData of parsedData) {
                        if (uData?.data?.hasOwnProperty("money")) {
                            uData.data["money"] = BigInt(uData.data["money"] ?? 0);
                        }
                        global.data.users.set(uData.userID, uData);
                    }
                } else if (filename == "effects.json") {
                    for (const eData of parsedData) {
                        if (!effects.has(eData.pluginName)) {
                            effects.register(eData.pluginName);

                            const pluginEffects = effects.get(eData.pluginName);
                            const expData = eData.exp;
                            const moneyData = eData.money;

                            for (const eD of expData) {
                                for (const efD of eD.effects) {
                                    pluginEffects.exp.add(eD.userID, efD.name, efD.value);
                                }
                            }

                            for (const eD of moneyData) {
                                for (const efD of eD.effects) {
                                    pluginEffects.money.add(eD.userID, efD.name, efD.value);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    #saveFile(path, data) {
        writeFileSync(path, data, "utf8");
    }

    async #handleMongoDB() {
        if (this.#database == "JSON") return;

        if (!process.env.MONGO_URL) throw new Error(global.getLang("database.mongo_url_not_found"));

        mongoose.set("strictQuery", false);
        this.#mongoConnection = (await mongoose.connect(process.env.MONGO_URL)).connection;

        const threadsData = await models.Threads.find({});
        const usersData = await models.Users.find({});
        const effectsData = await models.Effects.find({});

        for (const thread of threadsData) {
            // backward compatibility for old data
            thread.info.adminIDs = thread.info.adminIDs.map((e) => e?.id || e);
            global.data.threads.set(thread.threadID, thread, true);
        }

        for (const user of usersData) {
            global.data.users.set(user.userID, user);
        }

        for (const effect of effectsData) {
            if (!effects.has(effect.pluginName)) {
                effects.register(effect.pluginName);

                const pluginEffects = effects.get(effect.pluginName);
                const expData = effect.exp;
                const moneyData = effect.money;

                for (const eD of expData) {
                    for (const efD of eD.effects) {
                        pluginEffects.exp.add(eD.userID, efD.name, efD.value);
                    }
                }

                for (const eD of moneyData) {
                    for (const efD of eD.effects) {
                        pluginEffects.money.add(eD.userID, efD.name, efD.value);
                    }
                }
            }
        }
    }

    get DATABASE() {
        return this.#database;
    }

    get threads() {
        return this.#threads;
    }

    get users() {
        return this.#users;
    }

    get controllers() {
        return {
            Threads: this.#threads,
            Users: this.#users,
        };
    }

    get effects() {
        return this.#effects;
    }

    get models() {
        return this.#models;
    }

    async close() {
        if (this.#database == "JSON") return;

        await this.#mongoConnection.close();
    }

    async update() {
        if (this.#database == "JSON") {
            this.#updateJSON();
        } else {
            await this.#updateMONGO();
        }
    }
}

export { handleDatabase };
