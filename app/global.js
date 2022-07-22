import config from '../config/index.js';
import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { resolve } from 'path';


const NEW_GLOBAL = {
    client: new Object(),
    botID: new String(),
    libs: new Object(),
    statsData: new Object(),
    tempData: new Object(),
    getLang: new Function(),
    systemLangData: new Object(),
    pluginLangData: new Object()
}

NEW_GLOBAL.systemLangData = loadLanguage();
NEW_GLOBAL.getLang = function (key, objectData, plugin) {
    if (!key || typeof key !== 'string') return '';
    if (!objectData || typeof objectData !== 'object' || Array.isArray(objectData)) objectData = {};

    let gottenData = plugin ? pluginLangData[plugin][key] : systemLangData[key];
    for (const dataKey in objectData) {
        gottenData = gottenData.replace(`{${dataKey}}`, objectData[dataKey]);
    }

    return gottenData;
}

function loadLanguage() {
    try {
        const language = config.LANGUAGE || 'en_US';
        const languageData = yaml.load(readFileSync(resolve(`./app/languages/${language}.yml`), 'utf8'));
        return languageData;
    } catch (err) {
        console.error(err);
        process.exit(0);
    }
}


export default NEW_GLOBAL;
