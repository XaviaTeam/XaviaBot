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
        "tid.description": "Get thread's ID",
        "getAvt.description": "Get user's avatar",
        "say.description": "Text-to-speech",
        "say.error.noText": "Missing input!",
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
        "tid.description": "Xem ID của nhóm/cuộc trò chuyện",
        "getAvt.description": "Lấy avatar của người dùng",
        "say.description": "Text-to-speech",
        "say.error.noText": "Thiếu nhập liệu!",
    }
}


function help() {
    const config = {
        name: "help",
        aliases: ["cmds", "commands"],
        version: "1.0.1",
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
        version: "1.0.0",
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
        version: "1.0.0",
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
        version: "1.0.0",
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
        aliases: [],
        version: "1.0.0",
        description: getLang("uid.description", null, info.name),
        usage: "[@tag]",
        permissions: 2,
        cooldown: 5
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
        aliases: [],
        version: "1.0.0",
        description: getLang("tid.description", null, info.name),
        usage: "",
        permissions: 2,
        cooldown: 5
    }

    const onCall = async ({ message }) => {
        message.reply(message.threadID);
    }

    return { config, onCall };
}

function getAvt() {
    const config = {
        name: "getAvt",
        aliases: ["avt", "avatar"],
        version: "1.0.0",
        description: getLang("getAvt.description", null, info.name),
        usage: '[reply/tag]',
        permissions: 2,
        cooldown: 5
    }

    const onCall = async ({ message }) => {
        const { reply, mentions, senderID, type, messageReply } = message
        const uid = Object.keys(mentions).length == 0 ? type == "message_reply" ? messageReply.senderID : senderID : Object.keys(mentions)[0];
        const url = `https://graph.facebook.com/${uid}/picture?type=large&width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
        const path = client.mainPath + `/plugins/cache/avat_${Date.now()}.png`
        await downloadFile(path, url);

        const msg = {
            attachment: reader(path)
        }
        await reply(msg);
        await deleteFile(path);
    }

    return { config, onCall }
}

function say() {
    const config = {
        name: "say",
        aliases: ["tts", "talk", "speak"],
        version: "1.0.0",
        description: getLang("say.description", null, info.name),
        usage: '[text]',
        permissions: 2,
        cooldown: 5
    }

    const supportedLangs = ["sq", "af", "ar", "bn", "bs", "my", "ca", "hr", "cs", "da", "nl", "en", "et", "fil", "fi", "fr", "de", "el", "gu", "hi", "hu", "is", "id", "it", "ja", "kn", "km", "ko", "la", "lv", "ml", "mr", "ne", "nb", "pl", "pt", "ro", "ru", "sr", "si", "sk", "es", "sw", "sv", "ta", "te", "th", "tr", "uk", "ur", "vi"];

    const onCall = ({ message, args, getLang }) => {
        const { reply } = message;
        let lang, text;
        if (args.length == 0) {
            reply(getLang("say.error.noText"));
        } else {
            if (args.length > 1) {
                lang = args[0];
                text = [...args].slice(1).join(' ');
                if (!supportedLangs.includes(lang)) {
                    lang = "vi";
                    text = args.join(' ');
                }
            } else {
                lang = "vi";
                text = args[0];
            }

            getStream(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`)
                .then(stream => {
                    reply({ attachment: stream });
                })
                .catch(err => {
                    console.error(err);
                    reply("Error");
                })
        }

        return;
    }

    return { config, onCall };
}

function nino() {
    const config = {
        name: "nino",
        aliases: [],
        version: "1.0.0",
        description: getLang("nino.description", null, info.name),
        usage: "[text]",
        permissions: 2,
        cooldown: 5
    }

    const xDomain = "https://xaviateam.herokuapp.com";

    const onCall = ({ message, args }) => {
        const { reply } = message;
        const text = args.join(' ') || "Nino";

        GET(`${xDomain}/nino/get/${encodeURIComponent(text)}`)
            .then(res => {
                const answer = res.data.reply;
                reply(answer);
            })
            .catch(err => {
                console.error(err);
                reply("Error");
            })

        return;
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
        tid,
        getAvt,
        say,
        nino
    }
}
