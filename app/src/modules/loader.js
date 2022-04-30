/*
 *@author: DimensityDU (aka DungUwU)
 *Feel free to use this code as you wish, but please give credit to the original author.
 */

//TODO
//Command Aliases

'use strict';
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'fs';
import { execSync } from 'child_process';


const defaultModule = {
    description: '',
    usage: '',
    nsfw: [],
    credits: 'Anonymous',
    permissions: [0],
    dependencies: [],
    cooldown: 5,
}

const load = async (path, client) => {
    const { logger, isJSON } = client.modules;
    class module {
        constructor(data) {
            const { file, config, onLoad, category } = data;
            const moduleData = Object.assign(defaultModule, Object.assign(config, { category }));

            for (const key in moduleData) {
                this[key] = moduleData[key];
            }

            this.name = this.name || file.split('.')[0];
            this['onLoad'] = onLoad;

            if (!this.map) throw new Error('Module map is not defined.');

            if (this.cooldown && typeof this.cooldown === 'object') {
                for (const [key] of Object.entries(this.map)) {
                    if (this.cooldown[key] == null || typeof this.cooldown[key] !== 'number') {
                        logger.warn(`Cooldown for command ${key} is not valid, defaulting to 5 seconds.`);
                        this.cooldown[key] = 5;
                    }
                }
            } else {
                this.cooldown = (this.cooldown && this.cooldown != NaN && typeof this.cooldown == 'number') ? this.cooldown : 5;
                logger.warn(`Cooldown for module ${this.name} is not valid, defaulting to 5 seconds per command.`);
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

            if (config.options && config.options != null && typeof config.options === 'object') {
                const optionsPATH = client.rootPath + '/config/commandOptions.json';
                if (!existsSync(optionsPATH)) {
                    writeFileSync(optionsPATH, JSON.stringify({}, null, 4));
                }
                const optionsFile = readFileSync(optionsPATH, 'utf8');
                if (!isJSON(optionsFile)) {
                    logger.error('Command options file is not valid JSON, creating new one.');
                    writeFileSync(optionsPATH + '.bak', optionsFile);
                    writeFileSync(optionsPATH, JSON.stringify({}, null, 4));
                }
                const options = JSON.parse(optionsFile);
                for (const key in config.options) {
                    if (!options.hasOwnProperty(key) && config.options[key] != null) {
                        options[key] = config.options[key];
                    }
                }
                writeFileSync(optionsPATH, JSON.stringify(options, null, 4));
            }
        }

        async loadDependencies() {
            const { dependencies } = this;
            if (dependencies.length > 0) {
                for (const dependency of dependencies) {
                    try {
                        if (!libs.hasOwnProperty(dependency)) {
                            const dpdcPackage = await import(dependency);
                            libs[dependency] = dpdcPackage.default || dpdcPackage;
                        }
                    } catch (e) {
                        logger.custom(`Installing ${dependency} dependency.`, 'LOADER');
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
                            logger.info(`${dependency} installed.`);
                        } catch (err) {
                            console.log(err)
                            logger.error(`Dependency ${dependency} could not be installed.`);
                        }
                    }
                }
            }
        }

        loadCommand(key, value) {
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
                if (client.commands.has(info.name)) throw new Error(`Command ${info.name} already exists.`);
                info.execute = value;
            } else {
                throw new Error(`Can't load command ${info.name}, ${value} is not a function.`);
            }
            if (this.onLoad) {
                (async () => {
                    try {
                        await this.onLoad({ db: client.db });
                    } catch (e) {
                        logger.error(`Error while executing onLoad function for module ${this.name}:`);
                        logger.error(e);
                    }
                })();
            }
            client.commands.set(info.name, info);
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
                let commandPath = categoryPath + '/' + file;
                let commandStat = statSync(commandPath);
                if (commandStat.isFile()) {
                    try {
                        commandPath = '../../plugins/commands/' + category + '/' + file;

                        const commandData = await import(commandPath);
                        const { config, onLoad } = commandData;
                        const mdl = new module({
                            file,
                            config,
                            onLoad,
                            category
                        });
                        mdl.loadDependencies();
                        await Promise.all(Object.entries(mdl.map).map(async ([key, value]) => {
                            try {
                                mdl.loadCommand(key, value);
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
    logger.system(`Loaded ${moduleCount} module(s).`);
    logger.system(`----> ${client.commands.size} command(s).`);
    return client;
};

export default load;