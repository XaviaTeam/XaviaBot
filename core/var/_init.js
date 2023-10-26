import { readdirSync } from "fs";
import { resolve as resolvePath } from "path";
import { pathToFileURL } from "url";

import initializeGlobal from "./_global_info.js";
import * as common from "./common.js";

import { loadConfig, loadLang, getLang } from "./modules/loader.js";

async function loadModules() {
    // global modules will soon be deprecated
    try {
        const dirModules = readdirSync(
            resolvePath(global.corePath, "var", "modules")
        ).filter((file) => file.endsWith(".js"));

        for (const module of dirModules) {
            const modulePath = resolvePath(
                global.corePath,
                "var",
                "modules",
                module
            );
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

        
				Object.assign(global, common);

        global.config = loadConfig();

				// will soon be deprecated
				global.data.langSystem = loadLang();
				global.getLang = getLang;
    } catch (error) {
        throw error;
    }
}

export default initializeVar;
