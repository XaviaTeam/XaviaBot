/*
 * @author DungUwU <dungto76@gmail.com>
 */


//TODO
//Lock JSONs when authentication is done to prevent unauthorized access

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const defaultSettings = {
    structures: {},
    storage: './app/src/database/JSON/',
    backupStorage: './app/src/database/JSON/backup/'
}

class database {
    constructor(settings) {
        settings = Object.assign(defaultSettings, settings);
        for (const key in settings) {
            this[key] = settings[key];
        }

        this['storage'] = resolve(this['storage']);
        this['backupStorage'] = resolve(this['backupStorage']);

        if (!isExists(this.storage, 'dir')) {
            mkdirSync(this.storage, { recursive: true });
        }

        if (!isExists(this.backupStorage, 'dir')) {
            mkdirSync(this.backupStorage, { recursive: true });
        }

        for (const structure in this.structures) {
            this.checkStructure(structure);
            const path = join(this.storage, `${structure}.json`);
            if (!isExists(path, 'file')) {
                let dataFormat = this.getDataFromStructures(structure);
                writeFileSync(path, JSON.stringify(dataFormat, null, 4));
            }
        }
    }

    backup() {
        return new Promise((resolve, reject) => {
            const backupPath = join(this.backupStorage, 'backup.json');
            this.getAll()
                .then(data => {
                    let obj = {
                        data,
                        edited: new Date()
                    }
                    writeFileSync(backupPath, JSON.stringify(obj, null, 4));
                    resolve();
                }).catch(error => {
                    reject(error);
                });
        });
    }

    restore() {
        return new Promise((resolve, reject) => {
            const backupPath = join(this.backupStorage, 'backup.json');
            if (isExists(backupPath, 'file')) {
                try {
                    const content = readFileSync(backupPath, 'utf8');
                    if (!isJSON(content)) {
                        reject(getLang('database.error.JSONNotValid', { structure }));
                    }
                    const { data } = JSON.parse(content);
                    for (const structure in data) {
                        const path = join(this.storage, `${structure}.json`);
                        writeFileSync(path, JSON.stringify(data[structure], null, 4));
                    }
                    resolve();
                } catch (error) {
                    reject(error);
                }
            } else {
                reject(getLang('database.error.backupNotFound'));
            }
        });
    }

    checkStructure(structure) {
        if (!this.structures[structure]) {
            throw new Error(getLang('database.error.structureNotDefined'));
        }
        if (typeof this.structures[structure] != 'function') {
            throw new Error(getLang('database.error.structureNotValid'));
        }
        return true;
    }

    getDataFromStructures(structure) {
        return structure == 'Moderator' ? new this.structures[structure]({}, [], false) : [];
    }

    getAll() {
        return new Promise((resolve, reject) => {
            const data = {};
            for (const structure in this.structures) {
                const path = join(this.storage, `${structure}.json`);
                if (
                    this.checkStructure(structure) &&
                    isExists(path, 'file')
                ) {
                    const content = readFileSync(path, 'utf8');
                    if (!isJSON(content)) {
                        reject(getLang('database.error.JSONNotValid', { structure }));
                    }
                    data[structure] = JSON.parse(content);
                } else {
                    data[structure] = this.getDataFromStructures(structure);
                }
            }
            resolve(data);
        });
    }

    get(structure) {
        return new Promise((resolve, reject) => {
            structure = structure.charAt(0).toUpperCase() + structure.slice(1);
            let data;
            const path = join(this.storage, `${structure}.json`);
            if (isExists(path, 'file')) {
                const content = readFileSync(path, 'utf8');
                if (!isJSON(content)) {
                    reject(getLang('database.error.JSONNotValid', { structure }));
                }
                data = JSON.parse(content);
            } else {
                data = this.getDataFromStructures(structure);
            }
            resolve(data);
        });
    }

    set(structure, data) {
        return new Promise((resolve, reject) => {
            structure = structure.charAt(0).toUpperCase() + structure.slice(1);
            if (structure == 'Moderator' && Array.isArray(data)) {
                reject(getLang('database.error.moderatorDataNotValid'));
            }
            if (!data || (!Array.isArray(data) && structure != 'Moderator')) {
                reject(getLang('database.error.dataNotValid'));
            }
            const path = join(this.storage, `${structure}.json`);
            writeFileSync(path, JSON.stringify(data, null, 4));
            resolve();
        });
    }

    empty(structure) {
        return new Promise((resolve, reject) => {
            try {
                if (!structure) {
                    for (const structure in this.structures) {
                        const path = join(this.storage, `${structure}.json`);
                        const dataFormat = this.getDataFromStructures(structure);
                        writeFileSync(path, JSON.stringify(dataFormat, null, 4));
                    }
                } else {
                    this.checkStructure(structure);
                    const path = join(this.storage, `${structure}.json`);
                    const dataFormat = this.getDataFromStructures(structure);
                    writeFileSync(path, JSON.stringify(dataFormat, null, 4));
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default database;
