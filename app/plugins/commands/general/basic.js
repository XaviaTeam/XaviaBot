'use strict';
export const config = {
    name: "BasicCommands",
    description: {
        "about": "Basic Commands",
        "commands": {
            "help": "List all commands",
            "translate": "Translate text to English",
            "ping": "Get bot's delay in ms",
            "echo": "Echo back the message",
        }
    },
    usage: {
        "help": "[command_name]",
        "translate": "[lang] [text]",
        "ping": "",
        "echo": "[text]",
    },
    credits: "Xavia",
    permissions: [0, 1, 2],
    map: {
        help,
        ping,
        translate,
        echo
    },
    cooldown: {
        "help": 5,
        "translate": 5,
        "ping": 5,
        "echo": 5
    }
}

export const langData = {
    "en_US": {
        "0": "Member",
        "1": "Admin",
        "2": "Moderator",
        "help.commandInfo": `
            → {category} ←
            » Name: {name}
            » Credits: {credits}
            » Description: {description}
            » Usage: {usage}
            » Permissions: {permissions}
            » Cooldown: {cooldown}s
        `,
        "translate.error.noLang": "Please specify a language!",
        "translate.error.noText": "Please specify a text!",
        "translate.error.noTranslation": "Translation failed: {err}",
        "translate.success": "Translation: {translation}"
    },
    "vi_VN": {
        "0": "Thành viên",
        "1": "Quản trị viên",
        "2": "Điều hành viên",
        "help.commandInfo": `
            → {category} ←
            » Tên: {name}
            » Tác giả: {credits}
            » Miêu tả: {description}
            » Cú pháp: {usage}
            » Quyền: {permissions}
            » Thời gian chờ: {cooldown} giây
        `,
        "translate.error.noLang": "Vui lòng chỉ định ngôn ngữ!",
        "translate.error.noText": "Vui lòng chỉ định văn bản!",
        "translate.error.noTranslation": "Dịch thất bại: {err}",
        "translate.success": "Dịch: {translation}"
    }
}

function help({ api, event, args, controllers, getLang }) {
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
            const { category, name, description, usage, credits, permissions, cooldown } = command;
            const permissionsString = permissions.map(permission => {
                return getLang(permission.toString());
            }).join(', ');
            msg += getLang('help.commandInfo', {
                category,
                name,
                credits,
                description,
                usage: `${PREFIX}${name} ${usage}`,
                permissions: permissionsString,
                cooldown
            }).replace(/^ +/gm, '');
        }
    }

    api.sendMessage(msg, threadID, messageID);
    return;
}

function ping({ api, event }) {
    const { threadID, messageID } = event;
    const start = Date.now();

    api.sendMessage('Pong!', threadID, () => {
        const end = Date.now();
        const delay = end - start;
        api.sendMessage(`Delay: ${delay}ms`, threadID);
    }, messageID);

    return;
}

function translate({ api, event, args, getLang }) {
    const { threadID, messageID } = event;
    const lang = args[0];
    const text = args.slice(1).join(' ');

    if (!lang) return api.sendMessage(getLang('translate.error.noLang'), threadID, messageID);
    if (!text) return api.sendMessage(getLang('translate.error.noText'), threadID, messageID);

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${lang}&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    get(url)
        .then(res => {
            const translation = res.data[0][0][0];
            api.sendMessage(getLang('translate.success', { translation }), threadID, messageID);
        })
        .catch(err => {
            api.sendMessage(getLang('translate.error.noTranslation', { err }), threadID, messageID);
        });

    return;
}

function echo({ api, event, args }) {
    if (args.length > 0) {
        api.sendMessage(args.join(' '), event.threadID);
    }
    return;
}
