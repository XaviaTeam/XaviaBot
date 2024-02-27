import { readdirSync } from "fs";
import { resolve as resolvePath } from "path";
import { pathToFileURL } from "url";

import initializeGlobal from "./_global_info.js";
import * as utils from "./utils.js";

import { loadConfig, loadLang, getLang, loadDisabledPlugins } from "./modules/loader.js";

import { Balance } from "../handlers/balance.js";

async function loadModules() {
    // global modules will soon be deprecated
    try {
        const dirModules = readdirSync(resolvePath(global.corePath, "var", "modules")).filter(
            (file) => file.endsWith(".js")
        );

        for (const module of dirModules) {
            const modulePath = resolvePath(global.corePath, "var", "modules", module);
            const moduleURL = pathToFileURL(modulePath);
            const moduleExport = await import(moduleURL);

            global.modules.set(module.slice(0, -3), moduleExport);
        }
    } catch (error) {
        throw error;
    }
}

async function initializeVar() {
    try {
        await initializeGlobal();
        await loadModules();

        Object.assign(global, utils); // will soon be deprecated
        global.utils = utils;

        global.plugins.disabled = loadDisabledPlugins();
        global.config = loadConfig();

        // will soon be deprecated
        global.data.langSystem = loadLang();
        global.getLang = getLang;

        if (global.config.MAX_BALANCE_LIMIT != undefined) {
            Balance.setLimit(global.config.MAX_BALANCE_LIMIT);
        }
    } catch (error) {
        throw error;
    }
}

export default initializeVar;
