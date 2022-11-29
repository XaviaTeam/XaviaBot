import replitDB from "@replit/database";
import { resolve as resolvePath } from 'path';
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

/**
 * Check the encrypt state of the appstate then return the decrypted one.
 */
async function checkAppstate(APPSTATE_PATH, APPSTATE_PROTECTION) {
    const logger = global.modules.get('logger');
    const { isReplit, isGlitch } = global.modules.get('environments.get');

    let objAppState;
    APPSTATE_PATH = resolvePath(APPSTATE_PATH);

    if (!isExists(APPSTATE_PATH, "file")) {
        throw getLang('modules.checkAppstate.error.noAppstate');
    } else {
        logger.custom(getLang('modules.checkAppstate.foundAppstate'), 'LOGIN');
    }

    let appState = readFileSync(APPSTATE_PATH, 'utf8');
    appState = appState.startsWith("\"") ? JSON.parse(appState) : appState; // fixed...

    if (APPSTATE_PROTECTION !== true) {
        logger.custom(getLang('modules.checkAppstate.noProtection'), 'LOGIN');
        objAppState = await getAppStateNoProtection(APPSTATE_PATH, appState, isReplit, isGlitch);
    } else if (isReplit || isGlitch) {
        objAppState = await getAppStateWithProtection(APPSTATE_PATH, appState, isReplit);
    } else {
        logger.custom(getLang('modules.checkAppstate.error.notSupported'), 'LOGIN', "\x1b[33m");
        objAppState = await getAppStateNoProtection(APPSTATE_PATH, appState, isReplit, isGlitch);
    }

    return objAppState;
}

async function getAppStateNoProtection(APPSTATE_PATH, appState, isReplit, isGlitch) {
    const logger = global.modules.get('logger');
    const aes = global.modules.get('aes');

    let objAppState, APPSTATE_SECRET_KEY;

    try {
        if (isJSON(appState)) {
            objAppState = JSON.parse(appState);
            if (objAppState.length == 0) {
                if (!isGlitch || !isExists(resolvePath('.data', 'appstate.json'))) throw getLang('modules.checkAppstate.error.invalid');

                objAppState = JSON.parse(readFileSync(resolvePath('.data', 'appstate.json'), 'utf8'));
                writeFileSync(APPSTATE_PATH, JSON.stringify(objAppState, null, 2), 'utf8');
            }
        } else if (isReplit) {
            const db = new replitDB();
            let key_from_DB = await db.get('APPSTATE_SECRET_KEY');

            if (key_from_DB === null) throw getLang('modules.checkAppstate.error.noKey');

            APPSTATE_SECRET_KEY = key_from_DB;

            logger.custom(getLang('modules.checkAppstate.decrypting'), 'LOGIN');
            objAppState = aes.decrypt(appState, APPSTATE_SECRET_KEY);
            if (isJSON(objAppState)) objAppState = JSON.parse(objAppState);

            writeFileSync(APPSTATE_PATH, JSON.stringify(objAppState, null, 2), 'utf8');
        } else {
            throw getLang('modules.checkAppstate.error.invalid');
        }
    } catch (error) {
        throw error;
    }

    return objAppState;
}

async function getAppStateWithProtection(APPSTATE_PATH, appState, isReplit) {
    try {
        let objAppState, APPSTATE_SECRET_KEY;
        const logger = global.modules.get('logger');
        const aes = global.modules.get('aes');

        if (isReplit) {
            APPSTATE_SECRET_KEY = getRandomPassword();

            const db = new replitDB();
            let key_from_DB = await db.get('APPSTATE_SECRET_KEY');
            if (key_from_DB == null) {
                await db.set('APPSTATE_SECRET_KEY', APPSTATE_SECRET_KEY);
            } else {
                APPSTATE_SECRET_KEY = key_from_DB;
            }

            if (!isJSON(appState)) {
                try {
                    logger.custom(getLang('modules.checkAppstate.decrypting'), 'LOGIN');
                    objAppState = aes.decrypt(appState, APPSTATE_SECRET_KEY);
                    if (isJSON(objAppState)) objAppState = JSON.parse(objAppState); // idk why, but sometimes the decrypt function does not parse it
                } catch (err) {
                    console.error(err);
                    throw getLang('modules.checkAppstate.parsingError');
                }
            } else {
                objAppState = JSON.parse(appState);
                logger.custom(getLang('modules.checkAppstate.encrypting'), 'LOGIN');
                const encryptedAppState = aes.encrypt(objAppState, APPSTATE_SECRET_KEY);
                writeFileSync(APPSTATE_PATH, JSON.stringify(encryptedAppState), 'utf8');
            }
        } else {
            try {
                if (!isExists(resolvePath('.data', 'appstate.json'))) throw getLang('modules.checkAppstate.error.invalid');
                appState = JSON.parse(readFileSync(resolvePath('.data', 'appstate.json'), 'utf8'));
            } catch (err) {
                if (!err.code == 'ENOENT') throw err;

                try {
                    if (!isExists(resolvePath('.data'), 'dir')) global.createDir(resolvePath('.data'));
                } catch (err) {
                    if (!err.code == 'ENOENT') throw err;

                    global.createDir(resolvePath('.data'));
                }

                writeFileSync(resolvePath('.data', 'appstate.json'), JSON.stringify(appState, null, 2), 'utf8');
                writeFileSync(APPSTATE_PATH, JSON.stringify([], null, 2), 'utf8');

                execSync('refresh');
            }

            if (!isJSON(appState)) throw getLang('modules.checkAppstate.error.invalid');
            objAppState = JSON.parse(appState);
        }

        return objAppState;
    } catch (error) {
        throw error;
    }
}

export default checkAppstate;
