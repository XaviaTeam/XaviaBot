import * as modules from '../src/modules/index.js';
import { logger } from '../utils.js';

export default function () {
    return new Promise(async (resolve) => {
        const modulesCopy = Object.assign({}, modules.default, { logger });

        client.modules = modulesCopy;
        resolve();
    })
}
