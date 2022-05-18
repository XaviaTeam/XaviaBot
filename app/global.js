import axios from 'axios';
import config from '../config/index.js';
import yaml from 'js-yaml';
import { readFileSync } from 'fs';


const NEW_GLOBAL = {
    client: new Object(),
    botID: new String(),
    libs: new Object(),
    statsData: new Object(),
    tempData: new Object(),
    getLang: new Function(),
    systemLangData: new Object(),
    moduleLangData: new Object(),
    get: new Function()
}

NEW_GLOBAL.systemLangData = loadLanguage();
NEW_GLOBAL.getLang = function (key, objectData, module) {
    if (!key || typeof key !== 'string') return '';

    let gottenData = module ? moduleLangData[module][key] : systemLangData[key];
    for (const dataKey in objectData) {
        gottenData = gottenData.replace(`{${dataKey}}`, objectData[dataKey]);
    }

    return gottenData;
}

function loadLanguage() {
    try {
        const language = config.LANGUAGE || 'en_US';
        const languageData = yaml.load(readFileSync(process.cwd() + `/languages/${language}.yml`));
        return languageData;
    } catch (err) {
        console.log(err);
        process.exit(0);
    }
}

NEW_GLOBAL.get = axios.get;

export default NEW_GLOBAL;
