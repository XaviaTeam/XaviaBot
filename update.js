import { readFileSync, copyFileSync, existsSync, unlinkSync, mkdirSync, createWriteStream, statSync, rmSync } from 'fs';
import logger from './core/var/modules/logger.js';
import { resolve, dirname } from 'path';
import axios from 'axios';
import { createInterface } from 'readline';

const baseURL = "https://raw.githubusercontent.com/XaviaTeam/XaviaBot/main";
const allVersionsURL = "https://raw.githubusercontent.com/XaviaTeam/XaviaBotUpdate/main/_versions.json";


const checkUpdate = async () => {
    try {
        logger.custom("Checking for updates...", "UPDATE");
        const { data } = await axios.get(allVersionsURL);
        const currentVersion = JSON.parse(readFileSync('./package.json')).version;

        const updateScriptsArr = [];
        const newVersionIndex = Object.entries(data).findIndex(([versionFrom,]) => versionFrom == currentVersion);
        if (newVersionIndex != -1) {
            for (const [, versionAfter] of Object.entries(data).slice(newVersionIndex)) {
                const scriptsURL = `https://raw.githubusercontent.com/XaviaTeam/XaviaBotUpdate/main/_${versionAfter}.json`;
                const scripts = (await axios.get(scriptsURL)).data;

                updateScriptsArr.push(scripts);
            }
        }

        return updateScriptsArr;
    } catch (err) {
        logger.error('Failed to check for updates.');
        logger.error(err);
        process.exit(0);
    }
}

const mergeScripts = (list = []) => {
    const scripts = {
        changed: [],
        added: [],
        removed: []
    };

    for (const item of list) {
        for (const changed of item.changed) {
            if (!scripts.changed.some(e => e == changed)) {
                scripts.changed.push(changed);
            }
        }

        for (const added of item.added) {
            if (!scripts.added.some(e => e == added)) {
                scripts.added.push(added);
            }

            let indexInRemoved = scripts.removed.findIndex(e => e == added);
            if (indexInRemoved > -1) {
                scripts.removed.splice(indexInRemoved, 1);
            }
        }

        for (const removed of item.removed) {
            if (!scripts.removed.some(e => e == removed)) {
                scripts.removed.push(removed);
            }

            let indexInChanged = scripts.changed.findIndex(e => e == removed);
            let indexInAdded = scripts.added.findIndex(e => e == removed);

            if (indexInChanged > -1) {
                scripts.changed.splice(indexInChanged, 1);
            }
            if (indexInAdded > -1) {
                scripts.added.splice(indexInAdded, 1);
            }
        }
    }

    for (const [key, value] of Object.entries(scripts)) {
        scripts[key] = value.sort();
    }

    return scripts;
}

const toStringScripts = (scripts = []) => {
    const { changed, added, removed } = scripts;
    let text = "";

    if (changed.length > 0) {
        text += "Changed: \n";
        changed.forEach(item => {
            text += `- ${item}\n`;
        });
    }

    if (added.length > 0) {
        text += "Added: \n";
        added.forEach(item => {
            text += `- ${item}\n`;
        });
    }

    if (removed.length > 0) {
        text += "Removed: \n";
        removed.forEach(item => {
            text += `- ${item}\n`;
        });
    }

    return text;
}


const backupList = (lists = []) => {
    try {
        for (const list of lists) {
            for (const item of list) {
                const backupPath = resolve(`./backup/${item.slice(2)}`);
                const backupFolder = dirname(backupPath);

                if (!existsSync(backupFolder)) {
                    mkdirSync(backupFolder, { recursive: true });
                }

                const path = resolve(item);
                if (existsSync(path)) {
                    copyFileSync(path, backupPath);
                }
            }
        }
        copyFileSync("./package.json", "./backup/package.json");
    } catch (err) {
        console.error(err);
        logger.error("Failed to backup old files.");
        process.exit(0);
    }
}

const __change__add = (lists = []) => {
    for (const list of lists) {
        for (const item of list) {
            const path = resolve(item);
            const Folder = dirname(path);

            if (!existsSync(Folder)) {
                mkdirSync(Folder, { recursive: true });
            }

            axios.get(`${baseURL}/${item.slice(2)}`, { responseType: 'stream' })
                .then(res => {
                    const writer = createWriteStream(path);

                    res.data.pipe(writer);

                    writer.on('finish', () => {
                        logger.custom(`Updated ${item}`, "UPDATE");
                        writer.close();
                    })

                    writer.on('error', err => {
                        writer.close();
                        throw err;
                    })
                })
                .catch(err => {
                    throw err;
                })
        }
    }
}

const __remove = (list = []) => {
    for (const item of list) {
        const path = resolve(item);
        if (existsSync(path)) {
            let stat = statSync(path);
            if (stat.isDirectory()) {
                rmSync(path, { recursive: true, force: true });
            } else unlinkSync(path);
            logger.custom(`Removed ${item}`, "UPDATE");
        }
    }
}

const restore = (lists = []) => {
    logger.custom("Restoring...", "UPDATE");
    const backup = resolve("./backup");

    if (existsSync(backup)) {
        for (const list of lists) {
            for (const item of list) {
                const backupPath = resolve(`./backup/${item.slice(2)}`);
                const backupFolder = dirname(backupPath);
                const path = resolve(item);
                const Folder = dirname(path);

                if (existsSync(backupFolder)) {
                    if (!existsSync(Folder)) {
                        mkdirSync(Folder, { recursive: true });
                    }

                    copyFileSync(backupPath, path);
                }
            }
        }
    }
}

const update = (scripts, newPackage) => {
    try {
        const { changed, added, removed } = scripts;
        logger.custom("Updating...", "UPDATE");
        const backup = resolve("./backup");

        if (!existsSync(backup)) {
            mkdirSync(backup, { recursive: true });
        }

        backupList([changed, added, removed]);

        __change__add([changed, added]);
        __remove(removed);

        const packageWriter = createWriteStream("./package.json");
        packageWriter.write(JSON.stringify(newPackage, null, 2), 'utf8', (e) => {
            if (e) {
                throw e;
            }
            packageWriter.close();
        });
    } catch (err) {
        console.error(err);
        logger.error("Failed to update, aborting.");
        restore([changed, added, removed]);
        process.exit(0);
    }
}

const main = async () => {
    try {
        const updateScriptsArr = await checkUpdate() || [];
        if (updateScriptsArr.length == 0) {
            logger.custom("No update available...", "UPDATE");
            process.exit(0);
        } else {
            const mergedScripts = mergeScripts(updateScriptsArr);
            const text = toStringScripts(mergedScripts);
            const newPackage = (await axios.get(`${baseURL}/package.json`)).data;
            console.log(text);
            logger.warn("Please check the above changes and backup if necessary.");
            logger.warn("Folder 'backup' will be used to backup old files.");
            const rl = createInterface({
                input: process.stdin,
                output: process.stdout
            })

            rl.question("» Do you want to update? (y/n) ", answer => {
                if (answer.toLowerCase() === "y") {
                    rl.close();
                    update(mergedScripts, newPackage);
                } else {
                    rl.close();
                    logger.warn("Xavia will not be updated.");
                }
            })
        }
    } catch (e) {
        logger.error(e);
        logger.error("An error occured, try again later..");
        process.exit(0);
    }
};


main();
