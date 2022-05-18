import { } from 'dotenv/config'
import login from '@xaviabot/fca-unofficial';
import { writeFileSync } from "fs";
import aes from "./app/src/modules/aes.js";
import { logger } from "./app/utils.js";

const option = {
    logLevel: "silent",
    forceLogin: true,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.8 (KHTML, like Gecko)"
};

const loginData = {
    email: process.env.EMAIL,
    password: process.env.PASSWORD
}

const OTPKEY = process.env.OTPKEY


/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<void>}
 * Source: Github
 */


login(loginData, option, async (err, api) => {
    if (err) {
        const otpkey = OTPKEY.replace(/\s/g, '');
        switch (err.error) {
            case "login-approval":
                if (otpkey) {
                    const getToken = await import('totp-generator');
                    const token = getToken.default(otpkey);
                    err.continue(token);
                }
                else {
                    const { createInterface } = await import('readline');
                    const rl = createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
                    console.log("Please enter your OTP code: ");
                    rl.on("line", line => {
                        err.continue(line);
                        rl.close();
                    });
                }
                break;
            default:
                console.error(err);
                process.exit(0);
        }
        return;
    }
    const appState = api.getAppState();
    const encryptedAppState = aes.encrypt(JSON.stringify(appState), process.env.APPSTATE_SECRET_KEY);
    writeFileSync(process.env.APPSTATE_PATH, encryptedAppState);
    logger.info('Successfully logged in and saved appstate.');
    process.exit(1);
});

export default login;
