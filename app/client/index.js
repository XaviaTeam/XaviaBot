import NEW_GLOBAL from '../global.js';
global = Object.assign(global, NEW_GLOBAL);

import modules from './modules.js';
import config from './config.js';
import struct from './struct.js';
import data from './data.js';

import { resolve as resolvePath } from 'path';


export default function loadClient() {
    const defaultClient = {
        startTime: Date.now(),
        rootPath: resolvePath('.'),
        mainPath: resolvePath('./app'),
        maintenance: new Boolean(),
        version: '1.4.6'
    };
    Object.assign(client, defaultClient);
    return new Promise(async (resolve, reject) => {
        try {
            await modules();
            await config();
            await data();
            await struct();
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}
