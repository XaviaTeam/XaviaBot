export const info = {
    name: "BasicCommands",
    about: "Basic commands",
    credits: "Xavia"
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
            » Version: {version}
            » Permissions: {permissions}
            » Cooldown: {cooldown}s
            `,
        "translate.error.noLang": "Please specify a language!",
        "translate.error.noText": "Please specify a text!",
        "translate.error.noTranslation": "Translation failed: {err}",
        "translate.success": "Translation: {translation}",
        "help.description": "List all commands or get info about a command",
        "ping.description": "Get bot's delay in ms",
        "translate.description": "Translate text to English",
        "echo.description": "Echo back the message",
        "uid.description": "Get user's ID",
        "tid.description": "Get thread's ID"
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
            » Phiên bản: {version}
            » Quyền: {permissions}
            » Thời gian chờ: {cooldown} giây
        `,
        "translate.error.noLang": "Vui lòng chỉ định ngôn ngữ!",
        "translate.error.noText": "Vui lòng chỉ định văn bản!",
        "translate.error.noTranslation": "Dịch thất bại: {err}",
        "translate.success": "Dịch: {translation}",
        "help.description": "Liệt kê tất cả các lệnh hoặc xem chi tiết về lệnh.",
        "ping.description": "Kiểm tra delay gửi tin nhắn của bot.",
        "translate.description": "Dịch văn bản sang tiếng Anh",
        "echo.description": "Trả lại tin nhắn.",
        "uid.description": "Xem ID của người dùng",
        "tid.description": "Xem ID của nhóm/cuộc trò chuyện"
    }
}


function help() {
    const config = {
        name: "help",
        aliases: ["h"],
        description: getLang("help.description", null, info.name),
        usage: '[command_name]',
        permissions: 2,
        cooldown: 5
    }

    const onCall = async ({ message, args, getLang, userPermissions, prefix }) => {
        const { reply } = message;
        const input = args[0]?.toLowerCase();

        let msg = '';
        if (!input) {
            const categories = [... new Set(Array.from(client.registeredMaps.commandsInfo.values())
                .filter(value => value.permissions.some(p => userPermissions.some(up => up == p)))
                .map(value => value.category))];
            const commands = [... new Set(Array.from(client.registeredMaps.commandsInfo.values())
                .filter(value => value.permissions.some(p => userPermissions.some(up => up == p)))
                .map(value => {
                    return {
                        name: value.name,
                        category: value.category,
                    }
                }))];

            msg += `→ ${client.config.NAME} Help ←\n`;
            msg += categories.map(category => {
                return `\n[${category}]\n`
                    + commands
                        .filter(command => command.category === category)
                        .map(command => `${command.name}`)
                        .join(', ')
                    + '\n';
            }).join('');
            commands.length = 0;
            categories.length = 0;
        } else {
            if (client.registeredMaps.commandsInfo.has(input)) {
                const command = client.registeredMaps.commandsInfo.get(input);
                const { category, name, description, usage, version, credits, permissions, cooldown } = command;
                const permissionsString = permissions.map(permission => {
                    return getLang(permission.toString());
                }).join(', ');
                msg += getLang('help.commandInfo', {
                    category,
                    name,
                    credits,
                    description,
                    usage: `${prefix}${name} ${usage}`,
                    version,
                    permissions: permissionsString,
                    cooldown
                }).replace(/^ +/gm, '');
            }
        }

        reply(msg);
        return;
    }

    return { config, onCall };
}

function ping() {
    const config = {
        name: "ping",
        aliases: [],
        description: getLang("ping.description", null, info.name),
        usage: '',
        permissions: 2,
        cooldown: 5
    }

    const onCall = ({ message }) => {
        const { reply, send } = message;
        const start = Date.now();

        reply('Pong!')
            .then(() => {
                send(`Delay: ${Date.now() - start}ms`);
            })
            .catch(err => {
                console.error(err);
            })

        return;
    }

    return { config, onCall };
}

function translate() {
    const config = {
        name: "translate",
        aliases: ["trsl", "dich", "trans"],
        description: getLang("translate.description", null, info.name),
        usage: '[lang] [text]',
        permissions: 2,
        cooldown: 5
    }

    const onCall = ({ message, args, getLang }) => {
        const { reply } = message;
        const lang = args[0];
        const text = args?.slice(1).join(' ');

        if (!lang) return reply(getLang('translate.error.noLang'));
        if (!text) return reply(getLang('translate.error.noText'));

        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${lang}&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        GET(url)
            .then(res => {
                const translation = res.data[0][0][0];
                reply(getLang('translate.success', { translation }));
            })
            .catch(err => {
                reply(getLang('translate.error.noTranslation', { err }));
            });

        return;
    }

    return { config, onCall };
}

function echo() {
    const config = {
        name: "echo",
        aliases: ["rep"],
        description: getLang("echo.description", null, info.name),
        usage: '[text]',
        permissions: 2,
        cooldown: 5
    }

    const onCall = ({ message, args }) => {
        if (args.length > 0) {
            message.send(args.join(' '));
        }
        return;
    }

    return { config, onCall };
}

function uid() {
    const config = {
        name: "uid",
        aliases: ["id"],
        description: getLang("uid.description", null, info.name),
        usage: "[@tag]",
        permissions: 2,
        cooldown: 30
    }

    const onCall = async ({ message }) => {
        const { senderID, mentions, reply } = message;
        const msg = Object.keys(mentions).length == 0 ? senderID : Object.entries(mentions).map(e => `${e[1].replace(/@/g, '')} - ${e[0]}`).join("\n");
        
        reply(msg);
    }

    return { config, onCall };
}

function tid() {
    const config = {
        name: "tid",
        aliases: ["tc"],
        description: getLang("tid.description", null, info.name),
        usage: "",
        permissions: 2,
        cooldown: 30
    }

    const onCall = async ({ message }) => {
        message.reply(message.threadID);
    }

    return { config, onCall };
}


export const scripts = {
    commands: {
        help,
        ping,
        translate,
        echo,
        uid,
        tid
    }
}
