'use strict';
import { } from 'dotenv/config';


async function checkAppstate(APPSTATE_PATH, APPSTATE_SECRET_KEY, fs) {
    const { isJSON, logger, aes } = client.modules;
    const { readFileSync, writeFileSync, existsSync } = fs;
    const { join } = await import('path');

    APPSTATE_PATH = join(process.cwd(), '../', APPSTATE_PATH);

    if (!existsSync(APPSTATE_PATH)) {
        throw new Error(getLang('modules.checkAppstate.error.noAppstate'));
    } else {
        logger.custom(getLang('modules.checkAppstate.foundAppstate'), 'LOGIN');
    }

    if (!APPSTATE_SECRET_KEY) {
        throw getLang('modules.checkAppstate.error.noSecretKey');
    }


    const appState = readFileSync(APPSTATE_PATH, 'utf8');

    var objAppState;
    if (!isJSON(appState)) {
        try {
            logger.custom(getLang('modules.checkAppstate.decrypting'), 'LOGIN');
            const decryptedAppState = aes.decrypt(appState, APPSTATE_SECRET_KEY);
            objAppState = JSON.parse(decryptedAppState);
        } catch (err) {
            console.log(err);
            throw getLang('modules.checkAppstate.parsingError');
        }
    } else {
        objAppState = JSON.parse(appState);
        logger.custom(getLang('modules.checkAppstate.encrypting'), 'LOGIN');
        const encryptedAppState = aes.encrypt(JSON.stringify(objAppState), APPSTATE_SECRET_KEY);
        writeFileSync(APPSTATE_PATH, encryptedAppState);
    }
    return objAppState;
}

export default checkAppstate;
