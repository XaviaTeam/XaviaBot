/*
 *@author: DimensityDU (aka DungUwU)
 *Feel free to use this code as you wish, but please give credit to the original author.
 */


import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { pathToFileURL } from 'node:url';
import { execSync } from 'child_process';
import { logger } from '../../utils.js';
import { join } from 'path';


const defaultPluginInfo = {
    name: '',
    about: '',
    credits: "Anonymous",
    dependencies: [],
    extra: {}
};

const defaultCommandConfig = {
    name: '',
    aliases: [],
    description: '',
    usage: '',
    version: '1.0.0',
    permissions: [0],
    cooldown: 5,
    nsfw: false,
    visible: true
}

const backupPluginConfig = () => {
    const configPluginsPath = join(client.rootPath, '/config/config.plugins.json');
    client.configPluginsPath = configPluginsPath;
    if (!isExists(configPluginsPath, 'file')) {
        writeFileSync(configPluginsPath, JSON.stringify({}), 'utf8');
    }
    const configPluginsFile = readFileSync(configPluginsPath, 'utf8');
    if (!isJSON(configPluginsFile)) {
        logger.warn(getLang('modules.loader.warn.configPluginsCorrupted'));
        writeFileSync(configPluginsPath + '.corrupted.bak', configPluginsFile);
        writeFileSync(configPluginsPath, JSON.stringify({}), 'utf8');
    } else {
        writeFileSync(configPluginsPath + '.bak', configPluginsFile);
        logger.system(getLang('modules.loader.configPluginsBackedUp'));
    }

    return;
}

const installDependency = (dependency) => {
    return new Promise(async (resolve, reject) => {
        logger.custom(getLang('modules.loader.installingDependency', { dependency }), 'LOADER');

        try {
            await new Promise(async (resolve) => {
                execSync('npm install --save ' + dependency, {
                    stdio: 'inherit',
                    shell: true,
                    cwd: client.rootPath
                });
                resolve();
            });
            logger.info(getLang('modules.loader.dependencyInstalled', { dependency }));
            resolve();
        } catch (err) {
            console.error(err);
            reject(getLang('modules.loader.error.dependencyInstallFailed', { dependency }));
        }
    })
}

const loadPlugins = async (path) => {
    backupPluginConfig();

    class xPlugin {
        constructor(data) {
            const { file, info, category, scripts, langData } = data;
            const _defaultPluginInfo = { ...defaultPluginInfo };
            const pluginData = Object.assign(_defaultPluginInfo, Object.assign(info, { category }));

            for (const key in pluginData) {
                this[key] = pluginData[key];
            }

            this.name = this.name || file.slice(0, file.lastIndexOf('.'));
            if (client.plugins.has(this.name)) {
                let checkExists = true, count = 0;
                while (checkExists) {
                    if (client.plugins.has(this.name + '_' + count)) {
                        count++;
                        if (count >= 10) {
                            throw new Error(getLang('modules.loader.error.pluginExists', { pluginName: this.name }));
                        }
                    } else {
                        checkExists = false;
                        this.name = this.name + '_' + count;
                    }
                }
            }


            if (this.onLoad && typeof this.onLoad === 'function') {
                (async () => {
                    try {
                        await this.onLoad({ db: client.db });
                    } catch (e) {
                        logger.error(getLang('modules.loader.error.onLoad', { pluginName: this.name }));
                        logger.error(e);
                    }
                })();
            }

            if (!['commands', 'onMessage', 'onReact', 'onReply'].some(e => scripts.hasOwnProperty(e))) {
                throw new Error(getLang('modules.loader.error.scriptsEmpty', { pluginName: this.name }));
            }

            for (const key in scripts) {
                this[key] = scripts[key];
            }

            if (langData) {
                this.langData = langData;
            }
        }

        loadDependencies() {
            return new Promise(async (resolve) => {
                const { dependencies } = this;
                if (dependencies.length > 0) {
                    for (let i = 0; i < dependencies.length; i++) {
                        const dependency = dependencies[i];
                        if (dependency == 'eval') {
                            libs[dependency] = eval;
                        } else {
                            try {
                                for (let i = 0; i < 5; i++) {
                                    const timeNow = Date.now();
                                    while (Date.now() - timeNow > 500) { };
                                    try {
                                        if (!libs.hasOwnProperty(dependency)) {
                                            const dpdcPackage = await import(dependency);
                                            libs[dependency] = dpdcPackage.default || dpdcPackage;
                                            break;
                                        } else {
                                            break;
                                        }
                                    } catch (e) {
                                        if (i == 4) {
                                            throw e;
                                        }
                                    }
                                }
                            } catch (e) {
                                logger.error(e);
                            }
                        }
                    }
                }
                resolve();
            });
        }

        loadExtra() {
            return new Promise(async (resolve) => {
                const { extra } = this;

                if (
                    extra &&
                    typeof extra === 'object' &&
                    !Array.isArray(extra) &&
                    Object.keys(extra).length > 0
                ) {
                    const configPluginsFile = JSON.parse(readFileSync(client.configPluginsPath, 'utf8'));
                    if (!configPluginsFile.hasOwnProperty(this.name)) {
                        configPluginsFile[this.name] = {};
                    }
                    for (const [key, value] of Object.entries(extra)) {
                        if (
                            Object.prototype.toString.call(value) === '[object Date]' ||
                            typeof value === 'function' ||
                            value == undefined
                        ) continue;
                        else {
                            if (!configPluginsFile[this.name].hasOwnProperty(key)) {
                                configPluginsFile[this.name][key] = value;
                            }
                            if (!client.configPlugins.hasOwnProperty(this.name)) {
                                client.configPlugins[this.name] = {};
                            }
                            if (!client.configPlugins[this.name].hasOwnProperty(key)) {
                                client.configPlugins[this.name][key] = value;
                            }
                        }
                    }

                    writeFileSync(client.configPluginsPath, JSON.stringify(configPluginsFile, null, 4), 'utf8');
                }

                resolve();
            });
        }

        loadLangData() {
            return new Promise(async (resolve) => {
                const { LANGUAGE } = client.config;
                if (this.langData && this.langData.hasOwnProperty(LANGUAGE)) {
                    pluginLangData[this.name] = this.langData[LANGUAGE] || this.langData['en-US'];
                }
                resolve();
            });
        }

        loadSripts() {
            return new Promise(async (resolve, reject) => {
                const { commands, onMessage, onReact, onReply } = this;
                const pluginCommandsNames = [];

                if (commands && Object.keys(commands).length > 0) {
                    try {
                        for (const [key, value] of Object.entries(commands)) {
                            const commandName = await this.loadCommand(key, value);
                            pluginCommandsNames.push(commandName);
                        }
                    } catch (err) {
                        reject(err);
                    }
                }
                if (onMessage && typeof onMessage === 'function') {
                    client.registeredMaps.messages.set(this.name, { execute: onMessage });
                }
                if (onReact && typeof onReact === 'function') {
                    client.registeredMaps.reactions.set(this.name, { execute: onReact });
                }
                if (onReply && typeof onReply === 'function') {
                    client.registeredMaps.replies.set(this.name, { execute: onReply });
                }
                resolve(pluginCommandsNames);
            });
        }

        loadCommand(key, value) {
            return new Promise(async (resolve, reject) => {
                const { config, onCall } = value();
                const _defaultCommandConfig = { ...defaultCommandConfig };
                const commandConfig = Object.assign(_defaultCommandConfig, config);

                if (!commandConfig.name || typeof commandConfig.name !== 'string') {
                    commandConfig.name = key;
                }

                if (!commandConfig.credits || typeof commandConfig.credits !== 'string') {
                    commandConfig.credits = this.credits;
                }

                if (client.registeredMaps.commandsExecutable.has(commandConfig.name)) {
                    reject(new Error(getLang('modules.loader.error.commandAlreadyExists', { commandName: commandConfig.name })));
                }

                if (!commandConfig.aliases || !Array.isArray(commandConfig.aliases) || commandConfig.aliases.length === 0) {
                    commandConfig.aliases = [commandConfig.name];
                }
                if (!commandConfig.aliases.some(alias => alias === commandConfig.name)) {
                    commandConfig.aliases.push(commandConfig.name);
                }

                let acceptableAliases = [],
                    allCommandsAliases = Array.from(client.registeredMaps.commandsAliases.values());
                for (const alias of commandConfig.aliases) {
                    if (!allCommandsAliases.some(a => a === alias)) {
                        acceptableAliases.push(alias);
                    }
                }
                if (acceptableAliases.length === 0) {
                    reject(new Error(getLang('modules.loader.error.commandNoAcceptableAliases', { commandName: commandConfig.name })));
                }

                commandConfig.aliases = acceptableAliases;

                if (!commandConfig.description || typeof commandConfig.description !== 'string') {
                    commandConfig.description = '';
                }
                if (!commandConfig.usage || typeof commandConfig.usage !== 'string') {
                    commandConfig.usage = '';
                }
                if (!commandConfig.version || typeof commandConfig.version !== 'string') {
                    commandConfig.version = '1.0.0';
                }
                if (!commandConfig.cooldown || typeof commandConfig.cooldown !== 'number' || commandConfig.cooldown < 0) {
                    commandConfig.cooldown = 5;
                }

                if (!commandConfig.permissions && commandConfig.permissions !== 0) {
                    commandConfig.permissions = ['*'];
                }

                if (!Array.isArray(commandConfig.permissions)) {
                    if (typeof commandConfig.permissions === 'number') {
                        commandConfig.permissions = Array.from(Array(commandConfig.permissions + 1).keys());
                    } else {
                        commandConfig.permissions = [commandConfig.permissions];
                    }
                }

                if (commandConfig.permissions.some(p => p == '*')) {
                    commandConfig.permissions = [0, 1, 2];
                } else {
                    commandConfig.permissions = commandConfig.permissions
                        .filter(p => (p || p == 0) && p <= 2 && p >= 0)
                        .filter((p, i, a) => a.indexOf(p) === i)
                        .map(p => parseInt(p));
                }
                if (commandConfig.permissions.length === 0) {
                    logger.warn(getLang('modules.loader.warn.commandNoValidPermissions', { commandName: commandConfig.name }));
                    commandConfig.permissions = [0];
                }

                if (!commandConfig.nsfw || typeof commandConfig.nsfw !== 'boolean') {
                    commandConfig.nsfw = false;
                }
                if (
                    (!commandConfig.visible && commandConfig.visible !== false) ||
                    typeof commandConfig.visible !== 'boolean'
                ) {
                    commandConfig.visible = true;
                }

                if (typeof onCall !== 'function') {
                    reject(new Error(getLang('modules.loader.error.commandNotFunction', { commandName: commandConfig.name })));
                }

                client.registeredMaps.commandsInfo.set(commandConfig.name, { ...commandConfig, category: this.category });
                client.registeredMaps.commandsAliases.set(commandConfig.name, commandConfig.aliases);
                client.registeredMaps.commandsExecutable.set(commandConfig.name, onCall);
                resolve(commandConfig.name);
            });
        }
    }

    const allCommandCategory = readdirSync(path);

    const allPluginsData = [];
    for (let i = 0; i < allCommandCategory.length; i++) {
        const category = allCommandCategory[i];
        const categoryPath = path + category;

        if (isExists(categoryPath, 'dir') && category != 'cache' && category != 'Example') {
            const categoryPlugins = readdirSync(categoryPath).filter(file => file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs'));
            for (let j = 0; j < categoryPlugins.length; j++) {
                const file = categoryPlugins[j];
                const pluginPath = categoryPath + '/' + file;
                try {
                    if (isExists(pluginPath, 'file')) {
                        const pluginData = await import(pathToFileURL(pluginPath));
                        const { info, langData, scripts } = pluginData;

                        allPluginsData.push({
                            file,
                            category,
                            info,
                            langData,
                            scripts
                        });
                    }
                } catch (err) {
                    console.error(err);
                    logger.error('Error loading plugin: ' + file);
                }
            }

        }
    }

    async function installDependencies() {
        let _new_install = false;
        for (let i = 0; i < allPluginsData.length; i++) {
            const { info } = allPluginsData[i];
            if (info.hasOwnProperty('dependencies') && info.dependencies.length > 0) {
                for (let j = 0; j < info.dependencies.length; j++) {
                    try {
                        await import(info.dependencies[j]);
                    } catch (err) {
                        _new_install = true;
                        await installDependency(info.dependencies[j]);
                    }
                }
            }
        }

        if (_new_install) {
            process.exit(1);
        }
    }

    async function installPlugins() {
        for (let i = 0; i < allPluginsData.length; i++) {
            try {
                const { file, category, info, langData, scripts } = allPluginsData[i];
                const plugin = new xPlugin({ file, info, category, scripts, langData });

                await plugin.loadExtra();
                await plugin.loadLangData();
                await plugin.loadDependencies();

                const pluginCommandsNames = await plugin.loadSripts();

                client.plugins.set(plugin.name, pluginCommandsNames);
            } catch (err) {
                console.error(err);
                logger.error('Error loading plugin: ' + file);
            }
        }
    }

    await installDependencies();
    await installPlugins();

    client.configPlugins = JSON.parse(readFileSync(client.configPluginsPath, 'utf8'));
    logger.system(getLang('modules.loader.pluginsLoaded', { pluginsCount: client.plugins.size }));
    logger.system(getLang('modules.loader.commandsLoaded', { commandCount: client.registeredMaps.commandsExecutable.size }));
    return;
};

const loadDefaultEvents = async (path) => {
    const allEvents = readdirSync(path);
    for (let i = 0; i < allEvents.length; i++) {
        const file = allEvents[i];
        const eventPath = path + file;
        if (isExists(eventPath, 'file')) {
            try {
                const defaultEventData = (await import(pathToFileURL(eventPath))).default;
                client.registeredMaps.events.set(file.split('.')[0], defaultEventData);
            } catch (e) {
                console.error(e);
                logger.error('Error loading event: ' + file);
            }
        }
    }

    return;
}


export default function loadSripts(pluginPath, defaultEventsPath) {
    return new Promise(async (resolve) => {
        await loadPlugins(pluginPath);
        await loadDefaultEvents(defaultEventsPath);
        resolve();
    });
};

// function waitAllPromises(promises) {
//     return new Promise(async (resolve) => {
//         for (let i = 0; i < promises.length; i++) {
//             await promises[i]();
//         }
//         resolve();
//     })
// }
