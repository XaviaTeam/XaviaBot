import * as sysCommands from './commands.sys.js';
import * as fbchatCommands from './commands.fbchat.js';
import { helper } from './commands.helper.js';

export default function (command) {
    const allCommands = {...sysCommands, ...fbchatCommands, helper};
    for (const key in allCommands) {
        if (allCommands[key].aliases.some(alias => alias === command)) {
            if (key == 'helper') {
                allCommands[key].execute(allCommands);
                return { execute: () => { } };
            } else return allCommands[key];
        }
    }

    return null;
}
