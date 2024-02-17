import fs from "fs";
import path from "path";

import { isExists, createDir, isJSON, isURL, downloadFile, deleteFile } from "../var/utils.js";
import logger from "../var/modules/logger.js";

export class Assets {
    static #instance = null;
    #linksPath;
    #linksBackupPath;
    /** @type { {name: string, links: { [key:string]: string }}[] } */
    #data;
    #saveInterval;

    constructor() {
        if (Assets.#instance != null) throw new Error("Don't zo zat!!");

        this.#init();
        Assets.#instance = this;
    }

    #init() {
        const assetsDir = global.assetsPath;

        this.#linksPath = path.join(assetsDir, "links.json");
        this.#linksBackupPath = path.join(assetsDir, "links.bak.json");

        if (!isExists(assetsDir, "dir")) {
            createDir(assetsDir);
        }

        if (!isExists(this.#linksPath, "file")) {
            fs.writeFileSync(this.#linksPath, "[]");
        }

        const rawLinksData = fs.readFileSync(this.#linksPath, "utf8");
        if (!isJSON(rawLinksData)) {
            const backupData = this.#getBackupData();

            if (backupData == null) {
                logger.warn("ASSETS LINKS CORRUPTED. RECREATING...");
                this.#data = [];
            } else {
                logger.warn("ASSETS LINKS CORRUPTED. RESTORING FROM BACKUP...");
                this.#data = backupData;
            }

            this.#saveLinksData();
        } else {
            this.#data = JSON.parse(rawLinksData);
        }

        this.#validateLinks();

        const _5MINS = 5 * 60 * 1000;
        this.#saveInterval = setInterval(() => this.#saveLinksData(), _5MINS);
    }

    #validateLinks() {
        this.#data.forEach((e) => {
            for (const key in e.links) {
                if (!isExists(path.join(global.assetsPath, e.links[key]), "file")) {
                    delete e.links[key];
                }
            }
        });
    }

    static gI() {
        if (this.#instance == null) return new Assets();

        return this.#instance;
    }

    #getBackupData() {
        if (isExists(this.#linksBackupPath, "file")) {
            const rawBackupData = fs.readFileSync(this.#linksBackupPath, "utf8");

            if (isJSON(rawBackupData)) return JSON.parse(rawBackupData);
        }

        return null;
    }

    #saveLinksData() {
        fs.writeFileSync(this.#linksBackupPath, JSON.stringify(this.#data));
        fs.writeFileSync(this.#linksPath, JSON.stringify(this.#data));
    }

    /**
     * @param {string} assetPath
     */
    #_stream(assetPath) {
        return fs.createReadStream(assetPath);
    }

    /**
     * @param {string} name
     * @param {string} key
     */
    #_has(name, key) {
        return !!this.#data.find((asset) => asset.name == name)?.links?.hasOwnProperty(key);
    }

    /**
     * @param {string} name
     * @param {string} key
     */
    #_get(name, key) {
        if (!this.#_has(name, key)) return null;

        const linkedPath = this.#data.find((asset) => asset.name == name).links[key];

        return {
            path: path.join(global.assetsPath, linkedPath),
            stream: () => this.#_stream(path.join(global.assetsPath, linkedPath)),
        };
    }

    /**
     * @param {string} name
     * @param {string} key
     * @param {string} assetPath
     */
    #_set(name, key, assetPath) {
        this.#data.find((asset) => asset.name == name).links[key] = assetPath;
    }

    /**
     * @param {string} name
     * @param {string} key
     */
    #_drop(name, key) {
        if (!this.#_has(name, key)) return;

        try {
            deleteFile(this.#_get(name, key)?.path);
        } catch {
        } finally {
            delete this.#data.find((asset) => asset.name == name).links[key];
        }
    }

    /**
     * @param {{ name: string, key: string, path: string, src: string, overwrite?: boolean }} data
     * @param {{ headers: Record<string, string> }} options
     */
    async #_download({ name, key, path: assetPath, src, overwrite }, { headers } = {}) {
        if (this.#_has(name, key) && overwrite != true) return path;
        if (!isURL(src)) throw new Error("Invalid src");

        if (!this.#data.some((asset) => asset.name == name)) this.#data.push({ name, links: {} });

        if (assetPath.endsWith("/") || assetPath.length == 0) throw new Error("Invalid path");
        const lastSlashIndex = assetPath.lastIndexOf("/");
        if (lastSlashIndex != -1) {
            const assetDirectory = path.join(global.assetsPath, assetPath.slice(0, lastSlashIndex));
            if (!isExists(assetDirectory, "dir")) {
                createDir(assetDirectory);
            }
        }

        await downloadFile(path.join(global.assetsPath, assetPath), src, headers);
        this.#_drop(name, key);
        this.#_set(name, key, assetPath);

        return assetPath;
    }

    /**
     * @param {string} name 
     */
    from(name) {
        return {
            /**
             * @param {string} key
             */
            has: (key) => this.#_has(name, key),
            /**
             * @param {string} key
             */
            get: (key) => this.#_get(name, key),
            /**
             * @param {string} key
             */
            drop: (key) => this.#_drop(name, key),
            /**
             * @param {{ key: string, path: string, src: string, overwrite?: boolean }} data
             * @param {{ headers: Record<string, string> }} options
             */
            download: (data, options = {}) => this.#_download({ name, ...data }, options),
        };
    }

    dispose() {
        clearInterval(this.#saveInterval);
    }
}
