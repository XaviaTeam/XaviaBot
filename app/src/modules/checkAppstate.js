import { } from 'dotenv/config';

/**
 * Check the encrypt state of the appstate then return the decrypted one.
 */
async function checkAppstate(APPSTATE_PATH, APPSTATE_SECRET_KEY, dependencies) {
    const { logger, aes } = client.modules;
    const { readFileSync, writeFileSync, resolvePath } = dependencies;

    APPSTATE_PATH = resolvePath(APPSTATE_PATH);

    if (!isExists(APPSTATE_PATH, "file")) {
        throw getLang('modules.checkAppstate.error.noAppstate');
    } else {
        logger.custom(getLang('modules.checkAppstate.foundAppstate'), 'LOGIN');
    }

    if (!APPSTATE_SECRET_KEY) {
        throw getLang('modules.checkAppstate.error.noSecretKey');
    }


    let appState = readFileSync(APPSTATE_PATH, 'utf8');
    appState = appState.startsWith("\"") ? appState.slice(1, -1) : appState;

    let objAppState;
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

    return objAppState;
}

export default checkAppstate;
