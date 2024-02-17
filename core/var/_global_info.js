import { resolve as resolvePath } from "path";
import axios from "axios";

import { EffectsGlobal } from "../effects/index.js";
import { Assets } from "../handlers/assets.js";

export const effects = new EffectsGlobal();

const _global = {
    mainPath: resolvePath(process.cwd()),
    corePath: resolvePath(process.cwd(), "core"),
    cachePath: resolvePath(process.cwd(), "core", "var", "data", "cache"),
    assetsPath: resolvePath(process.cwd(), "core", "var", "assets"),
    tPath: resolvePath(process.cwd(), "core", "var", "data", "t_img"),
    config: new Object(),
    modules: new Map(),
    getLang: null,
    // Plugins:
    pluginsPath: resolvePath(process.cwd(), "plugins"),
    plugins: new Object({
        commands: new Map(),
        commandsAliases: new Map(),
        commandsConfig: new Map(),
        customs: new Number(0),
        events: new Map(),
        onMessage: new Map(),
        effects: effects,
        disabled: new Object({
            commands: new Object({
                byName: new Array(),
                byFilename: new Array(),
            }),
            customs: new Array(),
            events: new Array(),
            onMessage: new Array(),
        }),
    }),
    client: new Object({
        cooldowns: new Map(),
        replies: new Map(),
        reactions: new Map(),
    }),
    // Data
    data: new Object({
        users: new Map(),
        threads: new Map(),
        langPlugin: new Object(),
        langSystem: new Object(),
        messages: new Array(),
        temps: new Array(),
    }),
    listenMqtt: null,
    api: null,
    botID: null,
    controllers: null,
    xva_api: null,
    xva_ppi: null,
    server: null,
    refreshState: null,
    refreshMqtt: null,
    restart: restart,
    shutdown: shutdown,
    maintain: false,
};

function _change_prototype_DATA(data) {
    data.users.set = function (key, value, init = false) {
        if (!init) value.lastUpdated = Date.now();
        return Map.prototype.set.call(this, key, value);
    };

    data.threads.set = function (key, value, init = false) {
        if (!init) value.lastUpdated = Date.now();
        return Map.prototype.set.call(this, key, value);
    };

    return data;
}
async function getDomains() {
    try {
        const response = await axios.get(
            "https://raw.githubusercontent.com/XaviaTeam/XaviaAPIs/main/domains.json"
        );
        return response.data;
    } catch (error) {
        throw error;
    }
}

async function initializeGlobal() {
    const domains = await getDomains();

    global.mainPath = _global.mainPath;
    global.corePath = _global.corePath;
    global.cachePath = _global.cachePath;
    global.assetsPath = _global.assetsPath;
    global.tPath = _global.tPath;
    global.config = _global.config;
    global.modules = _global.modules;
    global.getLang = _global.getLang;
    // Plugins:
    global.pluginsPath = _global.pluginsPath;
    global.plugins = _global.plugins;

    global.client = _global.client;
    // Data
    global.data = _change_prototype_DATA(_global.data);
    // FCA
    global.listenMqtt = _global.listenMqtt;
    global.api = _global.api;
    global.botID = _global.botID;

    global.controllers = _global.controllers;
    global.xva_api = domains.xP22;
    global.xva_ppi = domains.xP21;
    global.server = _global.server;
    global.refreshState = _global.refreshState;
    global.refreshMqtt = _global.refreshMqtt;
    global.restart = _global.restart;
    global.shutdown = _global.shutdown;
    global.maintain = _global.maintain;
}

async function clear() {
    clearInterval(global.refreshState);
    clearInterval(global.refreshMqtt);
    Assets.gI().dispose();

    try {
        if (global.server) global.server.close();
        if (global.listenMqtt) global.listenMqtt.stopListening();
    } catch (error) {
        console.log(error);
    }

    for (const props in _global) {
        delete global[props];
    }
    global.gc();
}

async function restart() {
    await clear();
    process.exit(1);
}

async function shutdown() {
    await clear();
    process.exit(0);
}

export default initializeGlobal;
