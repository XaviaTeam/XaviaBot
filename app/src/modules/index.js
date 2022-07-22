import * as common from './common.js';

for (const func in common) {
    global[func] = common[func];
}


import aes from './aes.js';
import loader from './loader.js';
import checkAppstate from './checkAppstate.js';
import * as getEnvironments from './environments.get.js';


export default {
    aes,
    loader,
    checkAppstate,
    getEnvironments

}
