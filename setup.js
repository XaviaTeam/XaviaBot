import { createInterface } from 'readline';
import { readFileSync, writeFileSync, renameSync, existsSync } from 'fs';

const langData = {
    "vi_VN": {
        "-1": "Không tìm thấy .env.example",
        "1": "Tên Bot (xavia): ",
        "2": "Prefix (x):",
        "3": "ID của Admin Bot (id1 id2 id3): ",
        "4": "Tự khởi động Bot sau (7200000): ",

        "5": "Bạn có muốn setup file .env không? (y/n): ",
        "6": "APPSTATE_SECRECT_KEY (chuỗi ký tự bất kì): ",
        "7": "EMAIL: ",
        "8": "PASSWORD: ",
        "9": "OTPKEY: "
    },

    "en_US": {
        "-1": "Can't find .env.example",
        "1": "Bot Name (Xavia): ",
        "2": "Prefix (x): ",
        "3": "Bot Admin IDs (id1 id2 id3): ",
        "4": "Restart Interval (7200000): ",

        "5": "Do you want to setup .env file? (y/n): ",
        "6": "APPSTATE_SECRECT_KEY (randomString): ",
        "7": "EMAIL: ",
        "8": "PASSWORD: ",
        "9": "OTPKEY: "
    }
}

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

let config = {
    "LANGUAGE": "",
    "NAME": "Xavia",
    "PREFIX": "x",
    "MODERATORS": [],
    "REFRESH": 7200000
};


let envFile;
rl.question("1. Tiếng Việt\n2. English\n» Your choice: ", input => {
    const lang = input == 1 ? "vi_VN" : input == 2 ? "en_US" : null;
    if (!lang) {
        rl.close();
        process.exit(0);
    } else {
        const questions = langData[lang];
        config.LANGUAGE = lang;

        if (!existsSync("./.env.example")) {
            console.log(questions["-1"]);
            process.exit(0);
        }
        envFile = readFileSync('./.env.example').toString().split('\r\n');
        function getRandomPassword(length = 8, specialChars = false) {
            const letters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' + (specialChars ? '!@#$%^&*()_+~`|}{[]\:;?><,./-=' : '');
            let password = '';
            for (let i = 0; i < length; i++) {
                password += letters[Math.floor(Math.random() * letters.length)];
            }
            return password;
        }

        function setupConfig(count) {
            rl.question(questions[count], answer => {
                if (count == Object.keys(config).length) {
                    if (answer !== "y" && answer !== "n") {
                        setupConfig(count);
                    } else {
                        if (answer == "y") {
                            setupEnv(++count);
                        } else {
                            envFile[0] += getRandomPassword(16);
                            console.log("\nDone!");
                            rl.close();
                        }
                    }
                } else if (count == 3) {
                    config.MODERATORS = answer.length == 0 ? [] : answer.split(" ");
                    setupConfig(++count);
                } else if (count == 4) {
                    config.REFRESH = answer.length == 0 || isNaN(answer) ? 7200000 : parseInt(answer);
                    setupConfig(++count);
                } else {
                    config[Object.keys(config)[count]] = answer || Object.values(config)[count];
                    setupConfig(++count);
                }
            });
        }

        function setupEnv(count) {
            rl.question(questions[count], answer => {
                if (count == 6 && answer.length == 0) {
                    envFile[0] += getRandomPassword(16);
                    setupEnv(++count);
                } else if (count == 9) {
                    console.log("\nDone!");
                    rl.close();
                } else {
                    envFile[count - 6] += answer || "";
                    setupEnv(++count);
                }
            })
        }

        setupConfig(1);
    }
});

function replaceConfig() {
    const configMain = JSON.parse(readFileSync("./config/config.main.json"));
    const configKeys = Object.keys(config);
    for (let key in configMain) {
        if (configKeys.includes(key)) {
            configMain[key] = config[key];
        }
    }
    writeFileSync("./config/config.main.json", JSON.stringify(configMain, null, 4));
}


rl.on('close', () => {
    replaceConfig();
    try {
        console.log(envFile);
        writeFileSync("./.env.example", envFile.join("\r\n"), { encoding: "utf8" });
        renameSync("./.env.example", "./.env");
    } catch (error) {
        console.error(error);
    }

    process.exit(0);
});
