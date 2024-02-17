/**
 * Update script for XaviaBot
 * Feel free to modify the script to fit your needs as long as you don't remove the credits.
 *
 * @author RFS-ADRENO
 */

import axios from "axios";
import {
    copyFileSync,
    createWriteStream,
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    rmSync,
    statSync,
    unlinkSync,
    writeFileSync,
} from "fs";
import { dirname, resolve } from "path";
import { createInterface } from "readline";
import logger from "./core/var/modules/logger.js";

const baseURL = "https://raw.githubusercontent.com/XaviaTeam/XaviaBot/";
const allVersionsURL =
    "https://raw.githubusercontent.com/XaviaTeam/XaviaBotUpdate/main/v-heads.json";

/**
 *
 * @param {Record<string, any>} target
 * @param {Record<string, any>} source
 */
function deepAssign(target, source) {
    for (const key in source) {
        if (typeof source[key] == "object") {
            if (typeof target[key] == "object") deepAssign(target[key], source[key]);
            else target[key] = source[key];
        } else {
            target[key] = source[key];
        }
    }
}

const getBaseHead = async () => {
    try {
        logger.custom("Checking for updates...", "UPDATE");
        const { data } = await axios.get(allVersionsURL);
        const currentVersion = JSON.parse(readFileSync("./package.json")).version;

        const currentVersionIndex = data.findIndex((el) => el.version == currentVersion);
        if (currentVersionIndex <= 0) return null;

        return `${data[currentVersionIndex].head}...${data[0].head}`;
    } catch (err) {
        console.error(err);
        logger.error("Failed to check for updates.");
        process.exit(0);
    }
};

const getDiffs = async (gotBaseHead) => {
    const {
        data: { files },
    } = await axios.get(`https://api.github.com/repos/XaviaTeam/XaviaBot/compare/${gotBaseHead}`);
    /**
     * @type { { added: string[]; removed: string[]; modified: string[]; renamed: { old: string; new: string }[] } }
     */
    const diffs = {
        added: [],
        removed: [],
        modified: [],
        renamed: [],
    };

    for (const file of files) {
        if (
            file.filename == "config/config.plugins.json" ||
            file.filename == "config/config.plugins.disabled.json"
        )
            continue;

        switch (file.status) {
            case "added":
                diffs.added.push(file.filename);
                break;
            case "removed":
                diffs.removed.push(file.filename);
                break;
            case "modified":
                diffs.modified.push(file.filename);
                break;
            case "renamed":
                diffs.renamed.push({
                    new: file.filename,
                    old: file.previous_filename,
                });
                break;
        }
    }

    return diffs;
};

/**
 *
 * @param {{ added: string[]; removed: string[]; modified: string[]; renamed: { old: string; new: string }[] }} diffs
 * @returns
 */
const toStringDiffs = (diffs) => {
    const { added, removed, modified, renamed } = diffs;
    let text = "";

    if (added.length > 0) {
        text += "Added: \n";
        added.forEach((item) => {
            text += `- ${item}\n`;
        });
    }

    if (removed.length > 0) {
        text += "Removed: \n";
        removed.forEach((item) => {
            text += `- ${item}\n`;
        });
    }

    if (modified.length > 0) {
        text += "Modified: \n";
        modified.forEach((item) => {
            text += `- ${item}\n`;
        });
    }

    if (renamed.length > 0) {
        text += "Renamed: \n";
        renamed.forEach((item) => {
            text += `- ${item.old}\n  -> ${item.new}\n`;
        });
    }

    return text;
};

/**
 *
 * @param {string[]} filenames
 */
const backup = (filenames = []) => {
    try {
        for (const filename of filenames) {
            const backupPath = resolve(`./backup/${filename}`);
            const backupDir = dirname(backupPath);

            const filePath = resolve(filename);
            if (existsSync(filePath)) {
                if (!existsSync(backupDir)) {
                    mkdirSync(backupDir, { recursive: true });
                }
                copyFileSync(filePath, backupPath);
            }
        }
    } catch (err) {
        console.error(err);
        logger.error("Failed to backup old files.");
        process.exit(0);
    }
};

const mergePackageJSON = (lock = false) => {
    const oldPath = lock ? resolve("./backup/package-lock.json") : resolve("./backup/package.json");
    const newPath = lock ? resolve("./package-lock.json") : resolve("./package.json");

    const packageOld = JSON.parse(readFileSync(oldPath));
    const packageNew = JSON.parse(readFileSync(newPath));

    deepAssign(packageOld, packageNew);
    writeFileSync(newPath, JSON.stringify(packageOld, null, 2));
};

const mergePackageCONFIG = () => {
    const oldPath = resolve("./backup/config/config.main.json");
    const newPath = resolve("./config/config.main.json");

    const configOld = JSON.parse(readFileSync(oldPath));
    const configNew = JSON.parse(readFileSync(newPath));

    deepAssign(configNew, configOld);
    writeFileSync(newPath, JSON.stringify(configNew, null, 2));
};

/**
 *
 * @param {string[]} filenames
 * @param {string} head
 */
const __change__add = (filenames = [], head) => {
    for (const filename of filenames) {
        const filePath = resolve(filename);
        const fileDir = dirname(filePath);

        if (!existsSync(fileDir)) {
            mkdirSync(fileDir, { recursive: true });
        }

        axios
            .get(`${baseURL}/${head}/${filename}`, { responseType: "stream" })
            .then((res) => {
                const writer = createWriteStream(filePath);

                res.data.pipe(writer);

                writer.on("finish", () => {
                    if (filename == "package.json") mergePackageJSON();
                    if (filename == "package-lock.json") mergePackageJSON(true);
                    if (filename == "config/config.main.json") mergePackageCONFIG();
                    logger.custom(`Updated ${filename}`, "UPDATE");
                    writer.close();
                });

                writer.on("error", (err) => {
                    writer.close();
                    throw err;
                });
            })
            .catch((err) => {
                throw err;
            });
    }
};

const ensureNoEmptyFolder = (dirPath, init = true) => {
    if (resolve(".") == dirPath) return;

    const upperDir = resolve(dirPath, "..");
    const procDir = resolve(".");

    const upperDirItems = readdirSync(upperDir);

    if (init == true && readdirSync(dirPath).length > 0) return;
    if (upperDir != procDir && upperDirItems.length == 1) {
        return ensureNoEmptyFolder(upperDir, false);
    } else {
        rmSync(dirPath, { recursive: true, force: true });
    }

    return;
};

/**
 *
 * @param {string[]} filenames
 */
const __remove = (filenames = [], log = true) => {
    for (const filename of filenames) {
        const filePath = resolve(filename);
        if (existsSync(filePath)) {
            let stat = statSync(filePath);
            if (stat.isFile()) {
                unlinkSync(filePath);
                ensureNoEmptyFolder(dirname(filePath));
                if (log) logger.custom(`Removed ${filename}`, "UPDATE");
            }
        }
    }
};

/**
 *
 * @param {string[]} filenames
 */
const restore = (filenames) => {
    logger.custom("Restoring...", "UPDATE");
    const backupDir = resolve("./backup");

    if (existsSync(backupDir)) {
        for (const filename of filenames) {
            const backupPath = resolve(`./backup/${filename}`);
            const backupFolder = dirname(backupPath);
            const toRestorePath = resolve(filename);
            const toRestoreFolder = dirname(path);

            if (existsSync(backupFolder)) {
                if (!existsSync(toRestoreFolder)) {
                    mkdirSync(toRestoreFolder, { recursive: true });
                }

                copyFileSync(backupPath, toRestorePath);
            }
        }
    }
};

/**
 *
 * @param {{ added: string[]; removed: string[]; modified: string[]; renamed: { old: string; new: string }[] }} diffs
 * @param {string} head
 */
const update = (diffs, head) => {
    const { added, removed, modified, renamed } = diffs;
    try {
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question("\n» Clear the current backup folder? (y/n) ", (answer) => {
            rl.close();
            if (answer.toLowerCase() === "y") {
                const backupPath = resolve("./backup");
                rmSync(backupPath, { recursive: true, force: true });

                console.log();
                logger.custom("Updating...", "UPDATE");

                mkdirSync(backupPath, { recursive: true });

                backup(
                    Object.entries(diffs).reduce((acc, cur) => {
                        if (cur[0] == "renamed")
                            return [
                                ...acc,
                                ...cur[1].reduce((acc, cur) => [...acc, cur.old, cur.new], []),
                            ];

                        return [...acc, ...cur[1]];
                    }, [])
                );

                __change__add(
                    [...added, ...modified, ...renamed.reduce((acc, cur) => [...acc, cur.new], [])],
                    head
                );
                __remove([...removed, ...renamed.reduce((acc, cur) => [...acc, cur.old], [])]);
            } else {
                console.log();
                logger.warn("Update cancelled");
                process.exit(0);
            }
        });
    } catch (err) {
        console.error(err);
        logger.error("Failed to update, aborting.");
        restore([...modified, ...removed, ...renamed.reduce((acc, cur) => [...acc, cur.old], [])]);
        __remove([...added], false);
        process.exit(0);
    }
};

const main = async () => {
    try {
        const gotBaseHead = await getBaseHead();
        if (gotBaseHead == null) {
            logger.custom("No update available...", "UPDATE");
            process.exit(0);
        } else {
            const diffs = await getDiffs(gotBaseHead);
            const text = toStringDiffs(diffs);

            console.log(text);
            logger.warn("Please check the above changes and backup if necessary.");
            logger.warn("Folder 'backup' will be used to store old files.");
            const rl = createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            rl.question("\n» Do you want to update? (y/n) ", (answer) => {
                rl.close();
                if (answer.toLowerCase() === "y") {
                    update(diffs, gotBaseHead.split("...")[1]);
                } else {
                    console.log();
                    logger.warn("Update cancelled.");
                }
            });
        }
    } catch (err) {
        console.error(err);
        logger.error("An error occured, try again later..");
        process.exit(0);
    }
};

main();
