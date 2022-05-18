/*
 *@author: DimensityDU (aka DungUwU)
 *Feel free to use this code as you wish, but please give credit to the original author.
 */

//TODO
//Command Aliases

'use strict';
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'fs';
import { pathToFileURL } from 'node:url';
import { execSync } from 'child_process';
import { logger } from '../../utils.js';


const defaultModule = {
    description: '',
    usage: '',
    nsfw: [],
    credits: 'Anonymous',
    permissions: [0],
    dependencies: [],
    cooldown: 5,
}

const installDependency = (dependency) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!libs.hasOwnProperty(dependency)) {
                const dpdcPackage = await import(dependency);
                libs[dependency] = dpdcPackage.default || dpdcPackage;
            }
            resolve();
        } catch (e) {
            logger.custom(getLang('modules.loader.installingDependency', { dependency }), 'LOADER');
            try {
                await new Promise(async (resolve) => {
                    execSync('npm install --save ' + dependency, {
                        stdio: 'inherit',
                        shell: true,
                        cwd: client.rootPath
                    });
                    setTimeout(() => resolve(), 500);
                });
                if (!libs.hasOwnProperty(dependency)) {
                    const dpdcPackage = await import(dependency);
                    libs[dependency] = dpdcPackage.default || dpdcPackage;
                }
                logger.info(getLang('modules.loader.dependencyInstalled', { dependency }));
                resolve();
            } catch (err) {
                console.log(err);
                reject(getLang('modules.loader.error.dependencyInstallFailed', { dependency }));
            }
        }
    })
}

const loadCommands = async (path, client) => {
    const { isJSON } = client.modules;
    class commandModule {
        constructor(data) {
            const { file, config, onLoad, category } = data;
            const moduleData = Object.assign(defaultModule, Object.assign(config, { category }));

            for (const key in moduleData) {
                this[key] = moduleData[key];
            }

            this.name = this.name || file.split('.')[0];
            if (client.commandModules.has(this.name)) throw new Error(getLang('modules.loader.error.moduleExists', { moduleName: this.name }));

            this.commandNames = [];
            this['onLoad'] = onLoad;

            if (!this.map) throw new Error(getLang('modules.loader.error.noMap'));

            if (this.cooldown && typeof this.cooldown === 'object') {
                for (const [key] of Object.entries(this.map)) {
                    if (this.cooldown[key] == null || typeof this.cooldown[key] !== 'number') {
                        logger.warn(getLang('modules.loader.warn.commandCooldownNotValid', { commandName: key }));
                        this.cooldown[key] = 5;
                    }
                }
            } else {
                this.cooldown = (this.cooldown && this.cooldown != NaN && typeof this.cooldown == 'number') ? this.cooldown : 5;
                logger.warn(getLang('modules.loader.warn.moduleCooldownNotValid', { moduleName: this.name }));
                for (const key of Object.keys(this.map)) {
                    this.cooldown[key] = this.cooldown;
                }
            }

            if (this.description && this.description != null && typeof this.description === 'object') {
                if (!this.description.hasOwnProperty('about')) this.description.about = '';
                else if (typeof this.description.about !== 'string') this.description.about = '';

                if (!this.description.hasOwnProperty('commands')) {
                    this.description.commands = {};
                    for (const [key] of Object.entries(this.map)) {
                        this.description.commands[key] = '';
                    }
                } else {
                    for (const [key] of Object.entries(this.map)) {
                        if (!this.description.commands.hasOwnProperty(key)) this.description.commands[key] = '';
                        else if (typeof this.description.commands[key] !== 'string') this.description.commands[key] = '';
                    }
                }
            } else if (typeof this.description === 'string') {
                this.description = {
                    about: this.description,
                    commands: {}
                };
                for (const [key] of Object.entries(this.map)) {
                    this.description.commands[key] = '';
                }
            } else {
                this.description = {
                    about: '',
                    commands: {}
                };
                for (const [key] of Object.entries(this.map)) {
                    this.description.commands[key] = '';
                }
            }

            if (this.usage && typeof this.usage === 'object') {
                for (const [key] of Object.entries(this.map)) {
                    if (!this.usage.hasOwnProperty(key)) this.usage[key] = '';
                    else if (typeof this.usage[key] !== 'string') this.usage[key] = '';
                }
            } else {
                this.usage = {};
                for (const [key] of Object.entries(this.map)) {
                    this.usage[key] = '';
                }
            }

            if (this.options && this.options != null && typeof this.options === 'object') {
                const optionsPATH = client.rootPath + '/config/commandOptions.json';
                if (!existsSync(optionsPATH)) {
                    writeFileSync(optionsPATH, JSON.stringify({}, null, 4));
                }
                const optionsFile = readFileSync(optionsPATH, 'utf8');
                if (!isJSON(optionsFile)) {
                    logger.warn(getLang('modules.loader.warn.commandOptionsFound'));
                    writeFileSync(optionsPATH + '.bak', optionsFile);
                    writeFileSync(optionsPATH, JSON.stringify({}, null, 4));
                }
                const options = JSON.parse(optionsFile);
                if (!options.hasOwnProperty(this.name)) {
                    options[this.name] = {};
                }
                for (const key in this.options) {
                    if (!options.hasOwnProperty(key) && this.options[key] != null) {
                        options[this.name][key] = this.options[key];
                    }
                }
                writeFileSync(optionsPATH, JSON.stringify(options, null, 4));
            }
        }

        loadDependencies() {
            return new Promise(async (resolve) => {
                const { dependencies } = this;
                if (dependencies.length > 0) {
                    for (const dependency of dependencies) {
                        try {
                            await installDependency(dependency);
                        } catch (e) {
                            logger.error(e);
                        }
                    }
                }
                resolve();
            });
        }

        loadLanguage(langData) {
            return new Promise(async (resolve) => {
                const { LANGUAGE } = client.config;
                if (langData.hasOwnProperty(LANGUAGE)) {
                    moduleLangData[this.name] = langData[LANGUAGE] || langData['en-US'];
                }
                resolve();
            });
        }

        loadCommand(key, value) {
            return new Promise(async (resolve) => {
                const info = {
                    name: key.toLowerCase(),
                    nsfw: this.nsfw.includes(key) ? true : false,
                    description: this.description.commands[key],
                    usage: this.usage[key],
                    category: this.category.toUpperCase(),
                    credits: this.credits,
                    permissions: this.permissions,
                    cooldown: this.cooldown[key]
                }
                if (typeof value === 'function') {
                    if (client.commands.has(info.name)) throw new Error(getLang('modules.loader.error.commandExists', { commandName: info.name }));
                    info.execute = value;
                } else {
                    throw new Error(getLang('modules.loader.error.commandNotFunction', { commandName: info.name, functionName: value }));
                }
                if (this.onLoad) {
                    (async () => {
                        try {
                            await this.onLoad({ db: client.db });
                        } catch (e) {
                            logger.error(getLang('modules.loader.error.onLoad', { moduleName: this.name }));
                            logger.error(e);
                        }
                    })();
                }
                this.commandNames.push(info.name);
                client.commands.set(info.name, info);
                resolve();
            });
        }
    }

    let moduleCount = 0;
    const allCommandCategory = readdirSync(path);
    await Promise.all(allCommandCategory.map(async (category) => {
        const categoryPath = path + category;
        const categoryStat = statSync(categoryPath);
        if (categoryStat.isDirectory() && category != 'cache' && category != 'Example') {
            const allCommand = readdirSync(categoryPath).filter(file => file.endsWith('.js'));
            await Promise.all(allCommand.map(async (file) => {
                const commandPath = categoryPath + '/' + file;
                const commandStat = statSync(commandPath);
                if (commandStat.isFile()) {
                    try {
                        const commandData = await import(pathToFileURL(commandPath));
                        const { config, onLoad, langData } = commandData;
                        const mdl = new commandModule({
                            file,
                            config,
                            onLoad,
                            category
                        });
                        await mdl.loadDependencies();
                        if (langData) await mdl.loadLanguage(langData);
                        await Promise.all(Object.entries(mdl.map).map(async ([key, value]) => {
                            try {
                                await mdl.loadCommand(key, value);
                                client.commandModules.set(mdl.name, mdl.commandNames);
                            } catch (e) {
                                logger.error(e + ` at ${file}`);
                            }
                        }))
                        moduleCount++;
                    } catch (e) {
                        logger.error(e + ` at ${file}`);
                    }
                }
            }));
        }
    }));
    logger.system(getLang('modules.loader.modulesLoaded', { moduleCount }));
    logger.system(getLang('modules.loader.commandsLoaded', { commandCount: client.commands.size }));
    return client;
};

const loadEvents = async (path, client) => {
    const allEvent = readdirSync(path);
    await Promise.all(allEvent.map(async (file) => {
        let eventPath = path + file;
        let eventStat = statSync(eventPath);
        if (eventStat.isFile()) {
            try {
                const eventData = (await import(pathToFileURL(eventPath))).default;
                client.events.set(file.split('.')[0], eventData);
            } catch (e) {
                logger.error(e + ` at ${file}`);
            }
        }
    }));

    return client;
}


export default function loadPlugins(commandPath, eventPath, client) {
    return new Promise(async (resolve) => {
        client = await loadCommands(commandPath, client);
        client = await loadEvents(eventPath, client);
        resolve(client);
    });
};
