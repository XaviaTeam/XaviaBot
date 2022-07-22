import { } from "dotenv/config"
import login from "@xaviabot/fca-unofficial";
import { writeFileSync } from "fs";
import { resolve } from "path";
import aes from "./app/src/modules/aes.js";
import { logger } from "./app/utils.js";

const option = {
    logLevel: "silent",
    forceLogin: true,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0"
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
        const otpkey = OTPKEY.replace(/\s/g, "");
        switch (err.error) {
            case "login-approval":
                if (otpkey) {
                    const getToken = await import("totp-generator");
                    const token = getToken.default(otpkey);
                    err.continue(token);
                }
                else {
                    const { createInterface } = await import("readline");
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
    writeFileSync(resolve(process.env.APPSTATE_PATH), JSON.stringify(encryptedAppState), "utf8");
    logger.info("Successfully logged in and saved appstate.");
    process.exit(1);
});

export default login;
