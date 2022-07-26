import { readFileSync, copyFileSync, existsSync, unlinkSync, mkdirSync, createWriteStream } from 'fs';
import { logger } from './app/utils.js';
import { resolve, dirname } from 'path';
import semver from 'semver';
import axios from 'axios';
import { createInterface } from 'readline';

const baseURL = "https://raw.githubusercontent.com/XaviaTeam/XaviaBot/main";

logger.custom("Checking for updates...", "UPDATE");
axios.get(`${baseURL}/package.json`)
    .then(res => {
        const newPackage = res.data;
        const { version } = newPackage;
        const currentVersion = JSON.parse(readFileSync('./package.json')).version;
        if (semver.lt(currentVersion, version)) {
            logger.warn(`New version available: ${version}`);
            logger.warn(`Current version: ${currentVersion}`);

            const updateScripts = `https://raw.githubusercontent.com/XaviaTeam/XaviaBotUpdate/main/${version}.json`;
            axios.get(updateScripts)
                .then(res => {
                    const { changed, added, removed, preVersion } = res.data;
                    if (currentVersion != preVersion) {
                        logger.error("Seems like you're using an outdated version of XaviaBot, please fork again or update manually.");
                        process.exit(0);
                    }
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

                    if (text.length > 0) {
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
                                update({ changed, added, removed, newPackage });
                            } else {
                                rl.close();
                                logger.warn("Xavia will not be updated.");
                            }
                        })
                    } else {
                        logger.warn("No changes detected, please wait a few hours or update manually.");
                    }
                })
                .catch(err => {
                    logger.error('Failed to check for updates.');
                    logger.error(err);
                })
        } else {
            logger.custom("No updates available.", "UPDATE");
        }
    })
    .catch(err => {
        logger.error('Failed to check for updates.');
        logger.error(err);
    });


const update = ({ changed, added, removed, newPackage }) => {
    try {
        logger.custom("Updating...", "UPDATE");
        const backup = resolve("./backup");

        if (!existsSync(backup)) {
            mkdirSync(backup, { recursive: true });
        }

        backupList([changed, added, removed]);

        __change__add([changed, added]);
        __remove(removed);

        const packageWriter = createWriteStream("./package.json");
        packageWriter.write(JSON.stringify(newPackage, null, 2));
        packageWriter.close();
    } catch (err) {
        console.log(err);
        logger.error("Failed to update, aborting.");
        restore([changed, added, removed]);
        process.exit(0);
    }
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
        console.log(err);
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
            unlinkSync(path);
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
