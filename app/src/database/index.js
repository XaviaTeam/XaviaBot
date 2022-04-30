/*
 * @author DungUwU <dungto76@gmail.com>
 */


//TODO
//Lock JSONs when authentication is done to prevent unauthorized access

import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';

import isJSON from '../modules/isJSON.js';

const defaultSettings = {
    maxConnection: 10,
    currentConnection: 0,
    maxRetry: 10,
    retryAfter: 500,
    storage: process.cwd() + '/src/database/JSON/',
    structures: {}
}

class database {
    constructor(settings) {
        settings = Object.assign(defaultSettings, settings);
        for (const key in settings) {
            this[key] = settings[key];
        }

        if (!existsSync(this.storage) || !statSync(this.storage).isDirectory()) {
            mkdirSync(this.storage, { recursive: true });
        }

        for (const structure in this.structures) {
            this.checkStructure(structure);
            const path = join(this.storage, `${structure}.json`);
            if (!existsSync(path) || !statSync(path).isFile()) {
                let dataFormat = this.getDataFromStructures(structure);
                writeFileSync(path, JSON.stringify(dataFormat, null, 4));
            }
        }
    }

    authenticate() {
        if (this.currentConnection > 0) {
            throw new Error('Database is busy.');
        }
        this.currentConnection = 1;
    }

    close() {
        this.maxConnection = 0;
    }

    checkConnection() {
        if (this.currentConnection == 0) {
            return 'Database is not connected.';
        }
        if (this.currentConnection >= this.maxConnection) {
            throw new Error('Maximum number of connections reached.');
        }
        return true;
    }

    checkStructure(structure) {
        if (!this.structures[structure]) {
            throw new Error('structure is not defined.');
        }
        if (typeof this.structures[structure] != 'function') {
            throw new Error('structure is not a function/class.');
        }
        const index = this.structures[structure] ? 0 : 1;
        if (index === -1) return 1;
        return 0;
    }

    getDataFromStructures(structure) {
        return structure == 'Admin' ? new this.structures[structure]({}, [], false) : [];
    }

    getAll() {
        const data = {};
        for (const structure in this.structures) {
            const path = join(this.storage, `${structure}.json`);
            if (
                this.checkStructure(structure) == 0 &&
                existsSync(path) &&
                statSync(path).isFile()
            ) {
                const content = readFileSync(path, 'utf8');
                if (!isJSON(content)) {
                    throw new Error(`${structure} is not a valid JSON file.`);
                }
                data[structure] = JSON.parse(content);
            } else {
                data[structure] = this.getDataFromStructures(structure);
            }
        }
        return data;
    }

    get(structure) {
        structure = structure.charAt(0).toUpperCase() + structure.slice(1);
        let data;
        const path = join(this.storage, `${structure}.json`);
        if (existsSync(path)) {
            const content = readFileSync(path, 'utf8');
            if (!isJSON(content)) {
                throw new Error(`${structure} is not a valid JSON file.`);
            }
            data = JSON.parse(content);
        } else {
            data = this.getDataFromStructures(structure);
        }
        return data;
    }

    async set(structure, data) {
        return await new Promise((resolve, reject) => {
            structure = structure.charAt(0).toUpperCase() + structure.slice(1);
            let tempInt = this.maxRetry;
            try {
                let check = this.checkConnection();
                if (check != true) reject(check);
            } catch (e) {
                if (tempInt <= 0) {
                    reject(e);
                }
                tempInt--;
                setTimeout(() => this.set(structure, data), this.retryAfter);
            };
            if (structure == 'Admin' && Array.isArray(data)) {
                reject('Data for Admin should be an object.');
            }
            if (!data || (!Array.isArray(data) && structure != 'Admin')) {
                reject('Data is not defined or is not an array.');
            }
            this.currentConnection++;
            const path = join(this.storage, `${structure}.json`);
            writeFileSync(path, JSON.stringify(data, null, 4));
            this.currentConnection--;
            resolve();
        });
    }

    async empty(structure) {
        return await new Promise((resolve, reject) => {
            let tempInt = this.maxRetry;
            try {
                let check = this.checkConnection();
                if (check != true) reject(check);
            } catch (e) {
                if (tempInt <= 0) {
                    reject(e);
                }
                tempInt--;
                setTimeout(() => this.empty(structure), this.retryAfter);
            };
            this.currentConnection++;
            if (!structure) {
                for (const structure in this.structures) {
                    writeFileSync(`${this.storage}${structure}.json`, JSON.stringify([], null, 4));
                }
            } else {
                this.checkStructure(structure);
                const path = join(this.storage, `${structure}.json`);
                const dataFormat = this.getDataFromStructures(structure);
                writeFileSync(path, JSON.stringify(dataFormat, null, 4));
            }
            this.currentConnection--;
            resolve();
        });
    }
}

export default database;
