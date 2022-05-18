import NEW_GLOBAL from '../global.js';
global = Object.assign(global, NEW_GLOBAL);

import modules from './modules.js';
import config from './config.js';
import struct from './struct.js';
import data from './data.js';


export default async function loadClient() {
    const defaultClient = {
        startTime: Date.now(),
        rootPath: process.cwd() + '/..',
        mainPath: process.cwd(),
        comamndOptions: new Object(),
        maintenance: new Boolean(),
        version: '1.3.0'
    };
    return new Promise(async (resolve, reject) => {
        modules(defaultClient)
            .then(config)
            .then(struct)
            .then(data)
            .then(client => resolve(client))
            .catch(err => reject(err));
    });
}
