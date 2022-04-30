'use strict';
export const config = {
    name: "Example",
    description: {
        "about": "Basic Commands",
        "commands": {
            "help": "List all commands",
            "translate": "Translate text to English",
            "ping": "Get bot's delay in ms"
        }
    },
    usage: {
        "help": "[command_name]",
        "translate": "[lang] [text]",
        "ping": ""
    },
    credits: "Xavia",
    permissions: [0, 1, 2],
    map: {
        "help": help,
        "ping": ping,
        "translate": translate
    },
    dependencies: ['axios'],
    cooldown: {
        "help": 5,
        "translate": 5,
        "ping": 5
    }
}

function help({ api, event, args, controllers }) {
    const { threadID, messageID } = event;
    const threadData = controllers.Threads.getData(threadID) || {};
    const PREFIX = threadData.prefix || client.config.PREFIX;
    const input = args[0];

    var msg = '';
    if (!input) {
        const categories = [... new Set(Array.from(client.commands.values()).map(value => value.category))];
        const commands = [... new Set(Array.from(client.commands.values()).map(value => {
            return {
                name: value.name,
                category: value.category,
            }
        }))];

        msg += `→ ${client.config.NAME} Help ←\n`;
        msg += categories.map(category => {
            return `\n[${category}]\n` + commands.filter(command => command.category === category).map(command => `${command.name}`).join(', ') + '\n';
        }).join('');
        commands.length = 0;
        categories.length = 0;
    } else {
        if (client.commands.has(input.toLowerCase())) {
            const command = client.commands.get(input.toLowerCase());
            msg += `→ ${command.category} ←\n`;
            msg += `» Name: ${command.name}\n`;
            msg += `» Credits: ${command.credits}\n`;
            msg += `» Description: ${command.description}\n`;
            msg += `» Usage: ${PREFIX}${command.name} ${command.usage}\n`;
            msg += `» Permissions: ${command.permissions.join(', ')}\n`;
            msg += `» Cooldown: ${command.cooldown}s\n`;
        }
    }
    return api.sendMessage(msg, threadID, messageID);
}

function ping({ api, event }) {
    const { threadID, messageID } = event;
    const start = Date.now();
    return api.sendMessage('Pong!', threadID, () => {
        const end = Date.now();
        const delay = end - start;
        return api.sendMessage(`Delay: ${delay}ms`, threadID);
    }, messageID);
}

function translate({ api, event, args }) {
    const { threadID, messageID } = event;
    const lang = args[0];
    const text = args.slice(1).join(' ');
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${lang}&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    return get(url)
        .then(res => {
            const translation = res.data[0][0][0];
            return api.sendMessage(`Translation: ${translation}`, threadID, messageID);
        })
        .catch(err => {
            return api.sendMessage(`Translation failed: ${err}`, threadID, messageID);
        });
}
