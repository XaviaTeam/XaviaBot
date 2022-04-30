'use strict';
async function checkAppstate(APPSTATE_PATH, APPSTATE_SECRET_KEY, fs) {
    const { isJSON, logger, aes } = client.modules;
    const { readFileSync, writeFileSync, existsSync } = fs;
    const { join } = await import('path');
    
    APPSTATE_PATH = join(process.cwd(), '../', APPSTATE_PATH);
    const appState = readFileSync(APPSTATE_PATH, 'utf8');

    if (!existsSync(APPSTATE_PATH)) {
        logger.info('Appstate file not found!');
        throw new Error();
    } else {
        logger.info('Appstate file found!');
    }
    
    if (!APPSTATE_SECRET_KEY) {
        logger.info('APPSTATE_SECRET_KEY not found!');
        throw new Error();
    }

    var objAppState;
    if (!isJSON(appState)) {
        try {
            logger.info('Decrypting appstate file...');
            const decryptedAppState = aes.decrypt(appState, APPSTATE_SECRET_KEY);
            objAppState = JSON.parse(decryptedAppState);
        } catch (err) {
            console.log(err);
            logger.error('Appstate file is not valid JSON / could not be decrypted');
            throw new Error();
        }
    } else {
        objAppState = JSON.parse(appState);
        logger.info('Encrypting appstate file...');
        const encryptedAppState = aes.encrypt(JSON.stringify(objAppState), APPSTATE_SECRET_KEY);
        writeFileSync(APPSTATE_PATH, encryptedAppState);
        logger.info('Appstate file encrypted!');
    }
    return objAppState;
}

export default checkAppstate;