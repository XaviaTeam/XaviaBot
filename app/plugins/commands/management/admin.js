export const info = {
    name: "GroupAdminManager",
    about: "Basic commands for group admins",
    credits: "Xavia",
    dependencies: ["fs"]
}

export const langData = {
    "en_US": {
        "kick.error.missingTarget": "Please mention or reply to a user",
        "kick.error.emptyInfo": "Can\'t execute this command.",
        "kick.error.executorNotAdmin": "You are not an admin of this group",
        "kick.error.botNotAdmin": "I am not an admin of this group",
        "kick.error.botTarget": "I won\'t kick myself lol",
        "kick.error.unknown": "I can\'t kick this user\nTry refresh commands..",
        "kick.success": "Succeed: {successKickCount}, Failed: {errorKickCount}\nKicked:\n{targetNames}",
        "add.error.missingTarget": "Please input a user\'s uid or profile link",
        "add.error.invalidProfileLink": "Invalid profile link",
        "add.error.botTarget": "Why would I add myself?",
        "add.error.executorTarget": "How can I add you to your group?",
        "add.error.unknown": "I can\'t add this user\nMaybe I am not this group\'s admin or this user is already in this group...",
        "add.success": "{targetID} has been added",
        "group.info.error.missingCommand": "Please specify a command",
        "group.info.error.invalidCommand": "Invalid group command",
        "group.info.error.emptyInfo": "Can\'t get info of this group",
        "group.info.body": `
            -» Box Info
            Name: {name}
            ID: {id}
            Admins: {admins}
            Members: {members}
            Emoji: {emoji}
            Approval Mode: {approvalMode}
        `,
        "group.filter.error.emptyInfo": "Can\'t execute this command.",
        "group.filter.botNotAdmin": "I am not an admin of this group",
        "group.filter.success": "{successCount} accounts has been removed from this group",
        "group.settings.body": `
            -» Box Settings
            1. No Change Nickname: {noChangeNickname}
            2. No Change Box Name: {noChangeBoxName}
            3. No Change Box Image: {noChangeBoxImage}
            4. No Unsend Message: {noUnsendMessage}
            5. Allow NSFW: {allowNSFW}
            -» Reply with any of the above numbers to change the setting (true/false).
        `,
        "group.reply.success": "» Box settings changed:\n{SETTINGS}",
        "group.error.notGroup": "This is not a group",
        "group.error.executorNotAdmin": "Only group admins can use this command",
        "refresh.refreshing": "Refreshing group info...",
        "refresh.error.emptyInfo": "Can\'t refresh this group.",
        "refresh.success": "Box info has been refreshed",
        "any.error": "Something went wrong, try again later.",
        "kick.description": "Kick user(s) from the group",
        "add.description": "Add user to the group",
        "group.description": "Manage group",
        "refresh.description": "Refresh group info",
        "tagAll.description": "Tag all users in the group",
        "setPrefix.description": "Set group prefix",
        "setPrefix.success": "Thread's prefix has been set to {prefix}",
        "setPrefix.noPrefix": "Missing prefix..."
    },
    "vi_VN": {
        "kick.error.missingTarget": "Vui lòng gắn thẻ hoặc trả lời tin nhắn người dùng",
        "kick.error.emptyInfo": "Không thể thực hiện lệnh này.",
        "kick.error.executorNotAdmin": "Bạn không phải là quản trị viên nhóm này",
        "kick.error.botNotAdmin": "Tôi không phải là quản trị viên nhóm này",
        "kick.error.botTarget": "Tôi không thể kick chính mình",
        "kick.error.unknown": "Không thể kick người dùng này\nHãy dùng lệnh refresh và thử lại...",
        "kick.success": "Thành Công: {successKickCount}, Thất Bại: {errorKickCount}\nĐã Kick:\n{targetNames}",
        "add.error.missingTarget": "Vui lòng nhập uid hoặc link profile của người dùng",
        "add.error.invalidProfileLink": "Link profile không hợp lệ",
        "add.error.botTarget": "Tôi không thể thêm chính mình vào nhóm",
        "add.error.executorTarget": "Tôi không thể thêm bạn vào nhóm của bạn",
        "add.error.unknown": "Không thể thêm người dùng này\nCó thể tôi không phải là quản trị viên nhóm này hoặc người dùng này đã có trong nhóm...",
        "add.success": "{targetID} đã được thêm vào",
        "group.info.error.missingCommand": "Vui lòng chỉ định lệnh",
        "group.info.error.invalidCommand": "Lệnh không hợp lệ",
        "group.info.error.emptyInfo": "Không thể lấy thông tin của nhóm",
        "group.info.body": `
            -» Thông tin nhóm
            Tên: {name}
            ID: {id}
            Quản trị viên: {admins}
            Thành viên: {members}
            Biểu tượng: {emoji}
            Chế độ phê duyệt: {approvalMode}
        `,
        "group.filter.error.emptyInfo": "Không thể thực hiện lệnh này.",
        "group.filter.botNotAdmin": "Tôi không phải là quản trị viên nhóm này",
        "group.filter.success": "{successCount} tài khoản đã bị xóa khỏi nhóm",
        "group.settings.body": `
            -» Cài đặt nhóm
            1. Không thay đổi biệt danh: {noChangeNickname}
            2. Không thay đổi tên nhóm: {noChangeBoxName}
            3. Không thay đổi ảnh nhóm: {noChangeBoxImage}
            4. Không gỡ tin nhắn: {noUnsendMessage}
            5. Cho phép NSFW: {allowNSFW}
            -» Trả lời với một trong các số trên để thay đổi cài đặt (true/false).
        `,
        "group.reply.success": "» Điều chỉnh thành công:\n{SETTINGS}",
        "group.error.notGroup": "Đây không phải là một nhóm",
        "group.error.executorNotAdmin": "Chỉ có quản trị viên mới có thể thực hiện lệnh này",
        "refresh.refreshing": "Đang cập nhật thông tin nhóm...",
        "refresh.error.emptyInfo": "Không thể cập nhật thông tin nhóm.",
        "refresh.success": "Thông tin nhóm đã được cập nhật",
        "any.error": "Đã có lỗi xảy ra",
        "kick.description": "Kick người dùng khỏi nhóm",
        "add.description": "Thêm người dùng vào nhóm",
        "group.description": "Quản lý, xem, thay đổi thông tin nhóm",
        "refresh.description": "Cập nhật thông tin nhóm",
        "tagAll.description": "Gắn thẻ cho tất cả người dùng trong nhóm",
        "setPrefix.description": "Thay đổi prefix của nhóm",
        "setPrefix.success": "Đặt thành công: {prefix}",
        "setPrefix.noPrefix": "Thiếu prefix cần đặt.."
    }
}

async function onReply({ api, message, getLang, controllers, eventData }) {
    const { threadID, args, senderID, reply } = message;
    const { Threads } = controllers;

    if (senderID != eventData.author) return;
    if (args.length == 0) return;
    try {
        const boxData = await Threads.getData(threadID);
        let succeed = [],
            failed = [];
        const settingsQuery = [
            'noChangeNickname',
            'noChangeBoxName',
            'noChangeBoxImage',
            'resend',
            'nsfw'
        ];
        for (const index of args) {
            if (isNaN(index) || index < 1 || index > settingsQuery.length) {
                failed.push(index);
            } else {
                const setting = settingsQuery[index - 1];
                if (!boxData.hasOwnProperty(setting)) {
                    boxData[setting] = true;
                } else {
                    boxData[setting] = !boxData[setting];
                }
                succeed.push(`${setting} => ${boxData[setting] ? "On" : "Off"}`);
            }
        }

        await Threads.setData(threadID, boxData);
        let msg = getLang("group.reply.success", {
            SETTINGS: succeed.map(e => `- ${e}`).join('\n'),
        });
        reply(msg)
            .then(() => {
                api.unsendMessage(eventData.messageID);
            })
            .catch(err => {
                console.error(err);
                reply(getLang('any.error'));
                api.unsendMessage(eventData.messageID);
            })

    } catch (err) {
        console.error(err);
        reply(getLang('any.error'));
    }
}

function kick() {
    const config = {
        name: "kick",
        aliases: [],
        version: "1.0.0",
        description: getLang("kick.description", null, info.name),
        usage: "[@tag/reply]",
        permissions: [1],
        cooldown: 10
    }

    const onCall = async ({ api, message, getLang, controllers }) => {
        const { threadID, mentions, senderID, messageReply, type, reply } = message;
        if (Object.keys(mentions).length == 0 && type != 'message_reply') {
            reply(getLang('kick.error.missingTarget'));
        } else {
            try {
                const threadInfo = await controllers.Threads.getInfo(threadID) || {};
                const { adminIDs } = threadInfo;
                const targetIDs = messageReply?.senderID ? [messageReply.senderID] : Object.keys(mentions);

                if (Object.keys(threadInfo).length == 0) {
                    reply(getLang('kick.error.emptyInfo'));
                } else if (!adminIDs.some(e => e.id == senderID)) {
                    reply(getLang('kick.error.executorNotAdmin'));
                } else if (!adminIDs.some(e => e.id == botID)) {
                    reply(getLang('kick.error.botNotAdmin'));
                } else if (targetIDs.some(e => e == botID)) {
                    reply(getLang('kick.error.botTarget'));
                } else {
                    const successKickNames = [], errorKickCount = 0;
                    await Promise.allSettled(targetIDs.map(async (targetID) => new Promise(async (resolve, reject) => {
                        api.removeUserFromGroup(targetID, threadID, async (err) => {
                            if (err) {
                                errorKickCount++;
                                reject();
                            } else {
                                const targetName = await controllers.Users.getName(targetID) || targetID;
                                successKickNames.push(targetName);
                                resolve();
                            }
                        });
                    })));

                    reply(getLang('kick.success', { targetNames: successKickNames.join(', '), errorKickCount, successKickCount: successKickNames.length }));
                }
            } catch (error) {
                console.error(error);
                reply(getLang('kick.error.unknown'));
            }
        }

        return;
    }

    return { config, onCall };
}

function add() {
    const config = {
        name: "add",
        aliases: [],
        version: "1.0.0",
        description: getLang("add.description", null, info.name),
        usage: "[profileURL/UID]",
        permissions: [1],
        cooldown: 10
    }

    const onCall = async ({ api, message, args, getLang }) => {
        const { threadID, senderID, reply } = message;
        const input = args[0]?.toLowerCase();

        if (!input) {
            reply(getLang('add.error.missingTarget'));
        } else {
            try {
                let uid = !isNaN(input) ? input : input.match(/(?:(?:http|https):\/\/)?(?:www.|m.)?facebook.com\/(?!home.php)(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\.-]+)/)[1];
                if (isNaN(uid)) {
                    uid = (await api.getUserID(uid))[0].userID;
                }

                if (!uid || isNaN(uid)) {
                    reply(getLang('add.error.invalidProfileLink'));
                } else {
                    if (uid == botID) {
                        reply(getLang('add.error.botTarget'));
                    } else if (uid == senderID) {
                        reply(getLang('add.error.executorTarget'));
                    } else {
                        api.addUserToGroup(uid, threadID, (err) => {
                            if (err) {
                                reply(getLang('add.error.unknown'));
                            } else {
                                reply(getLang('add.success', { targetID: uid }));
                            }
                        });
                    }
                }
            } catch (error) {
                console.error(error);
                reply(getLang('add.error.unknown'));
            }
        }

        return;
    }

    return { config, onCall };
}

function group() {
    const config = {
        name: "group",
        aliases: [],
        version: "1.0.0",
        description: getLang("group.description", null, info.name),
        usage: "[info/filter/settings]",
        permissions: [1],
        cooldown: 10
    }

    const onCall = async ({ api, message, args, getLang, controllers, userPermissions }) => {
        const { threadID, senderID, reply } = message;
        const { Threads } = controllers;
        const input = args[0]?.toLowerCase();
        if (!input) {
            reply(getLang('group.info.error.missingCommand'));
        } else {
            if (["filter", "settings"].some(e => e == input)) {
                if (!userPermissions.some(e => e == 1)) {
                    reply(getLang('group.error.executorNotAdmin'));
                }
            }
            try {
                switch (input) {
                    case 'info':
                        {
                            const boxInfo = await api.getThreadInfo(threadID) || {};
                            if (Object.keys(boxInfo).length == 0) {
                                reply(getLang('group.info.error.emptyInfo'));
                            } else {
                                let msg = {};

                                msg.body = getLang('group.info.body', {
                                    name: boxInfo.threadName,
                                    id: boxInfo.threadID,
                                    admins: boxInfo.adminIDs.length,
                                    members: boxInfo.participantIDs.length,
                                    emoji: boxInfo.emoji,
                                    approvalMode: boxInfo.approvalMode ? 'On' : 'Off'
                                }).replace(/^ +/gm, '');

                                let imgdir = client.mainPath + `/plugins/cache/${boxInfo.threadID}_${Date.now()}_info.png`;
                                if (boxInfo.imageSrc) {
                                    await downloadFile(imgdir, boxInfo.imageSrc);
                                    msg.attachment = reader(imgdir);
                                }
                                reply(msg)
                                    .then(async () => {
                                        if (msg.hasOwnProperty('attachment')) {
                                            await deleteFile(imgdir);
                                        }
                                    })
                                    .catch(async err => {
                                        console.error(err);
                                        if (msg.hasOwnProperty('attachment')) {
                                            await deleteFile(imgdir);
                                        }
                                        reply(getLang('any.error'));
                                    });
                            }
                        }
                        break;
                    case 'filter':
                        {
                            const boxInfo = await Threads.getInfoApi(threadID) || {};
                            if (boxInfo.hasOwnProperty("isGroup") && boxInfo.isGroup == false) {
                                reply(getLang('group.error.notGroup'));
                            }
                            if (Object.keys(boxInfo).length == 0) {
                                reply(getLang('group.filter.error.emptyInfo'));
                            } else {
                                const { userInfo, adminIDs } = boxInfo;
                                if (!adminIDs.some(e => e.id == senderID)) {
                                    reply(getLang('group.error.executorNotAdmin'));
                                } else if (!adminIDs.some(e => e.id == botID)) {
                                    reply(getLang('group.filter.error.botNotAdmin'));
                                } else {
                                    const deadAccounts = [];
                                    for (const user of userInfo) {
                                        if (!user.hasOwnProperty('gender') || user.gender == undefined) {
                                            deadAccounts.push(user.id);
                                        }
                                    }

                                    let successCount = 0;
                                    const interval = setInterval(() => {
                                        if (deadAccounts.length == 0) {
                                            clearInterval(interval);
                                            reply(getLang('group.filter.success', { successCount }));
                                        } else {
                                            api.removeUserFromGroup(deadAccounts.shift(), threadID, (err) => {
                                                if (err) {
                                                    console.error(err);
                                                } else {
                                                    successCount++;
                                                }
                                            });
                                        }
                                    }, 300);
                                }
                            }
                        }
                        break;
                    case 'settings':
                        {
                            const boxData = await Threads.getData(threadID) || {};
                            const boxInfo = await Threads.getInfo(threadID) || {};
                            if (boxInfo.hasOwnProperty("isGroup") && boxInfo.isGroup == false) {
                                reply(getLang('group.error.notGroup'));
                            }
                            let msg = getLang('group.settings.body', {
                                noChangeNickname: boxData.noChangeNickname ? 'On' : 'Off',
                                noChangeBoxName: boxData.noChangeBoxName ? 'On' : 'Off',
                                noChangeBoxImage: boxData.noChangeBoxImage ? 'On' : 'Off',
                                noUnsendMessage: boxData.resend ? 'On' : 'Off',
                                allowNSFW: boxData.nsfw ? 'On' : 'Off'
                            }).replace(/^ +/gm, '');

                            reply(msg)
                                .then(data => data.addReplyEvent())
                                .catch(err => {
                                    console.error(err);
                                    reply(getLang('any.error'));
                                })
                        }
                        break;
                    default:
                        reply(getLang('group.info.error.invalidCommand'));
                        break;
                }
            } catch (error) {
                console.error(error);
                reply(getLang('any.error'));
            }
        }

        return;
    }

    return { config, onCall };
}

function refresh() {
    const config = {
        name: "refresh",
        aliases: [],
        version: "1.0.0",
        description: getLang("refresh.description", null, info.name),
        usage: "",
        permissions: [1, 2],
        cooldown: 43200
    }

    const onCall = ({ message, getLang, controllers }) => {
        const { threadID, send, reply } = message;

        send(getLang('refresh.refreshing'))
            .then(async () => {
                try {
                    const threadInfo = await controllers.Threads.getInfoApi(threadID) || {};
                    if (Object.keys(threadInfo).length == 0) {
                        reply(getLang('refresh.error.emptyInfo'));
                    } else {
                        reply(getLang('refresh.success'));
                    }
                } catch (error) {
                    console.error(error);
                    reply(getLang('any.error'));
                }
            })
            .catch(err => {
                console.error(err);
                reply(getLang('any.error'));
            })

        return;
    }

    return { config, onCall };
}

function tagAll() {
    const config = {
        name: "tagAll",
        aliases: ["all", "tagall", "everyone"],
        version: "1.0.0",
        description: getLang("tagAll.description", null, info.name),
        usage: "[text]",
        permissions: [1],
        cooldown: 30
    }

    const onCall = async ({ message, args, controllers }) => {
        const { threadID, senderID, send, reply } = message;
        try {
            const threadInfo = await controllers.Threads.getInfo(threadID) || {};

            if (!threadInfo.hasOwnProperty('participantIDs')) return;

            const participantIDs = threadInfo.participantIDs.filter(e => e != senderID && e != botID);
            const ptcpLength = participantIDs.length;
            const emptyChar = '\u200B';

            let msg = args.join(" ") || "@everyone",
                mentions = [];

            for (let i = 0; i < ptcpLength; i++) {
                if (msg.length <= i) msg += emptyChar;
                mentions.push({
                    tag: msg[i],
                    id: participantIDs[i]
                })
            }
            send({
                body: msg,
                mentions
            });

            return;
        } catch (error) {
            console.error(error);
            reply(getLang('any.error'));
        }
    }

    return { config, onCall };
}

function setPrefix() {
    const config = {
        name: "setPrefix",
        aliases: ["setPre", "setPf"],
        version: "1.0.1",
        description: getLang("setPrefix.description", null, info.name),
        usage: "[prefix]",
        permissions: [1],
        cooldown: 30
    }

    const onCall = async ({ message, args, controllers, getLang }) => {
        const { reply, threadID } = message;
        const { Threads } = controllers;

        try {
            const userData = await Threads.getData(threadID) || {};

            const prefix = args.join(" ") || null;
            if (prefix == null) reply(getLang('setPrefix.noPrefix'));
            else {
                userData.prefix = prefix;

                await Threads.setData(threadID, userData);
                reply(getLang('setPrefix.success', { prefix }));
            }
        } catch (error) {
            console.error(error);
            reply(getLang('any.error'));
        }

        return;
    }

    return { config, onCall };
}

export const scripts = {
    commands: {
        kick,
        add,
        group,
        refresh,
        tagAll,
        setPrefix
    },
    onReply
}
