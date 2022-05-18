import { readFileSync, existsSync, writeFileSync } from 'fs';

export default function (client) {
    return new Promise(async (resolve) => {
        const struct = {
            commandModules: new Map(),
            commands: new Map(),
            commandCooldowns: new Map(),
            events: new Map(),
            replies: new Array(),
            reactions: new Array()
        };

        client = Object.assign(client, struct);

        const commandsPath = client.mainPath + '/plugins/commands/';
        const eventsPath = client.mainPath + '/plugins/events/';
        client.modules.loader(commandsPath, eventsPath, client).then(client => {
            const comamndOptionsPath = client.rootPath + '/config/commandOptions.json';
            if (!existsSync(comamndOptionsPath)) {
                writeFileSync(comamndOptionsPath, JSON.stringify({}));
            }
            client.comamndOptions = JSON.parse(readFileSync(comamndOptionsPath));
            resolve(client);
        })
    })
}
