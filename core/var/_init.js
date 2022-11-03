import { readdirSync } from 'fs';
import { resolve as resolvePath } from 'path';
import { pathToFileURL } from 'url';

import _init_global from './_global_info.js';
import common from './common.js';

function _load_global() {
    _init_global();
}

async function _get_modules() {
    const dirModules = readdirSync(resolvePath(global.corePath, 'var', 'modules')).filter(file => file.endsWith('.js'));

    for (const module of dirModules) {
        const modulePath = resolvePath(global.corePath, 'var', 'modules', module);
        const moduleURL = pathToFileURL(modulePath);
        const moduleExport = await import(moduleURL);

        global.modules.set(module.slice(0, -3), moduleExport.default);
    }
}

function _load_common() {
    for (const [key, value] of Object.entries(common)) {
        global[key] = value;
    }
}

function _load_config() {
    global.config = global.modules.get('loader').loadConfig();
}

function _load_lang() {
    global.data.langSystem = global.modules.get('loader').loadLang();
    global.getLang = global.modules.get('loader').getLang;
}

async function _load_plugins() {
    await global.modules.get('loader').loadPlugins();
}

async function _init_var() {
    _load_global();

    await _get_modules();

    _load_common();
    _load_config();
    _load_lang();

    await _load_plugins();
}


export default _init_var;
