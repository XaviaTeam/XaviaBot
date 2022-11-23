import { join } from 'path';

export default function () {
    return new Promise(async (resolve) => {
        const struct = {
            plugins: new Map(),
            registeredMaps: new Object({
                commandsExecutable: new Map(),
                commandsAliases: new Map(),
                commandsInfo: new Map(),
                events: new Map(),
                replies: new Map(),
                reactions: new Map(),
                messages: new Map()
            }),
            handleMaps: new Object({
                commandsCooldowns: new Map(),
                replies: new Map(),
                reactions: new Map()
            }),
            configPluginsPath: new String(),
            configPlugins: new Object()
        };

        Object.assign(client, struct);

        const pluginsPath = join(client.mainPath, '/plugins/commands/');
        const defaultEventsPath = join(client.mainPath, '/plugins/events/');
        await client.modules.loader(pluginsPath, defaultEventsPath);

        resolve();
    })
}
