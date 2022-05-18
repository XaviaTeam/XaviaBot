'use strict';
export const config = {
    name: "GroupAdminManager",
    description: {
        "about": "Basic Commands",
        "commands": {
            "kick": "Kick User",
            "add": "Add User",
            "box": "Manage Box",
            "refresh": "Refresh Box Info",
            "all": "Tag All Users"
        }
    },
    usage: {
        "kick": "[@tag/reply]",
        "add": "[uid/profile_link]",
        "box": "[image/info/filter/settings]",
        "refresh": "",
        "all": "[text]"
    },
    credits: "Xavia",
    permissions: [1],
    map: {
        kick,
        add,
        box,
        refresh,
        "all": tagAll
    },
    dependencies: [
        'fs'
    ],
    cooldown: {
        "kick": 10,
        "add": 10,
        "box": 10,
        "refresh": 60 * 60 * 12,
        "all": 60
    }
}

export const langData = {
    "en_US": {
        "kick.error.missingTarget": "Please mention or reply to a user",
        "kick.error.emptyInfo": "Can\'t execute this command.",
        "kick.error.executorNotAdmin": "You are not an admin of this group",
        "kick.error.botNotAdmin": "I am not an admin of this group",
        "kick.error.botTarget": "I won\'t kick myself lol",
        "kick.error.unknown": "I can\'t kick this user\nTry refresh commands..",
        "kick.success": "{targetName} has been kicked",
        "add.error.missingTarget": "Please input a user\'s uid or profile link",
        "add.error.invalidProfileLink": "Invalid profile link",
        "add.error.botTarget": "Why would I add myself?",
        "add.error.executorTarget": "How can I add you to your group?",
        "add.error.unknown": "I can\'t add this user\nMaybe I am not this group\'s admin or this user is already in this group...",
        "add.success": "{targetID} has been added",
        "box.info.error.missingCommand": "Please specify a command",
        "box.info.error.invalidCommand": "Invalid box command",
        "box.info.error.emptyInfo": "Can\'t get info of this box",
        "box.info.body": `
            -» Box Info
            Name: {name}
            ID: {id}
            Admins: {admins}
            Members: {members}
            Emoji: {emoji}
            Approval Mode: {approvalMode}
        `,
        "box.filter.error.emptyInfo": "Can\'t execute this command.",
        "box.filter.executorNotAdmin": "You are not an admin of this group",
        "box.filter.botNotAdmin": "I am not an admin of this group",
        "box.filter.success": "{successCount} accounts has been removed from this group",
        "box.settings.body": `
            -» Box Settings
            1. No Change Nickname: {noChangeNickname}
            2. No Change Box Name: {noChangeBoxName}
            3. No Change Box Image: {noChangeBoxImage}
            4. No Unsend Message: {noUnsendMessage}
            5. Allow NSFW: {allowNSFW}
            -» Reply with any of the above numbers to change the setting (true/false).
        `,
        "refresh.refreshing": "Refreshing box info...",
        "refresh.error.emptyInfo": "Can\'t refresh this box.",
        "refresh.success": "Box info has been refreshed"
    },
    "vi_VN": {
        "kick.error.missingTarget": "Vui lòng gắn thẻ hoặc trả lời tin nhắn người dùng",
        "kick.error.emptyInfo": "Không thể thực hiện lệnh này.",
        "kick.error.executorNotAdmin": "Bạn không phải là quản trị viên nhóm này",
        "kick.error.botNotAdmin": "Tôi không phải là quản trị viên nhóm này",
        "kick.error.botTarget": "Tôi không thể kick chính mình",
        "kick.error.unknown": "Không thể kick người dùng này\nHãy dùng lệnh refresh và thử lại...",
        "kick.success": "{targetName} đã bị kick",
        "add.error.missingTarget": "Vui lòng nhập uid hoặc link profile của người dùng",
        "add.error.invalidProfileLink": "Link profile không hợp lệ",
        "add.error.botTarget": "Tôi không thể thêm chính mình vào nhóm",
        "add.error.executorTarget": "Tôi không thể thêm bạn vào nhóm của bạn",
        "add.error.unknown": "Không thể thêm người dùng này\nCó thể tôi không phải là quản trị viên nhóm này hoặc người dùng này đã có trong nhóm...",
        "add.success": "{targetID} đã được thêm vào",
        "box.info.error.missingCommand": "Vui lòng chỉ định lệnh",
        "box.info.error.invalidCommand": "Lệnh không hợp lệ",
        "box.info.error.emptyInfo": "Không thể lấy thông tin của nhóm",
        "box.info.body": `
            -» Thông tin nhóm
            Tên: {name}
            ID: {id}
            Quản trị viên: {admins}
            Thành viên: {members}
            Biểu tượng: {emoji}
            Chế độ phê duyệt: {approvalMode}
        `,
        "box.filter.error.emptyInfo": "Không thể thực hiện lệnh này.",
        "box.filter.executorNotAdmin": "Bạn không phải là quản trị viên nhóm này",
        "box.filter.botNotAdmin": "Tôi không phải là quản trị viên nhóm này",
        "box.filter.success": "{successCount} tài khoản đã bị xóa khỏi nhóm",
        "box.settings.body": `
            -» Cài đặt nhóm
            1. Không thay đổi biệt danh: {noChangeNickname}
            2. Không thay đổi tên nhóm: {noChangeBoxName}
            3. Không thay đổi ảnh nhóm: {noChangeBoxImage}
            4. Không gỡ tin nhắn: {noUnsendMessage}
            5. Cho phép NSFW: {allowNSFW}
            -» Trả lời với một trong các số trên để thay đổi cài đặt (true/false).
        `,
        "refresh.refreshing": "Đang cập nhật thông tin nhóm...",
        "refresh.error.emptyInfo": "Không thể cập nhật thông tin nhóm.",
        "refresh.success": "Thông tin nhóm đã được cập nhật"
    }
}

async function kick({ api, event, getLang, controllers }) {
    const { threadID, messageID, mentions, senderID, messageReply } = event;
    if (Object.keys(mentions).length == 0 && event.type != 'message_reply') {
        api.sendMessage(getLang('kick.error.missingTarget'), threadID, messageID);
    } else {
        const threadInfo = await controllers.Threads.getInfo(threadID) || {};
        const { adminIDs } = threadInfo;
        const targetID = event.type == 'message_reply' ? messageReply.senderID : Object.keys(mentions)[0];

        if (Object.keys(threadInfo).length == 0) {
            api.sendMessage(getLang('kick.error.emptyInfo'), threadID, messageID);
        } else if (!adminIDs.some(e => e.id == senderID)) {
            api.sendMessage(getLang('kick.error.executorNotAdmin'), threadID, messageID);
        } else if (!adminIDs.some(e => e.id == botID)) {
            api.sendMessage(getLang('kick.error.botNotAdmin'), threadID, messageID);
        } else if (targetID == botID) {
            api.sendMessage(getLang('kick.error.botTarget'), threadID, messageID);
        } else {
            const targetName = await controllers.Users.getName(targetID);
            api.removeUserFromGroup(targetID, threadID, (err) => {
                if (err) {
                    api.sendMessage(getLang('kick.error.unknown'), threadID, messageID);
                } else {
                    api.sendMessage(getLang('kick.success', { targetName }), threadID, messageID);
                }
            });
        }
    }

    return;
}

async function add({ api, event, args, getLang }) {
    const { threadID, messageID, senderID } = event;
    const input = args[0] || '';

    if (input == '') {
        api.sendMessage(getLang('add.error.missingTarget'), threadID, messageID);
    } else {
        let uid = input.match(/(?:(?:http|https):\/\/)?(?:www.|m.)?facebook.com\/(?!home.php)(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\.-]+)/)[1];
        if (isNaN(uid)) {
            uid = (await api.getUserID(uid))[0].userID;
        }

        if (!uid || isNaN(uid)) {
            api.sendMessage(getLang('add.error.invalidProfileLink'), threadID, messageID);
        } else {
            if (uid == botID) {
                api.sendMessage(getLang('add.error.botTarget'), threadID, messageID);
            } else if (uid == senderID) {
                api.sendMessage(getLang('add.error.executorTarget'), threadID, messageID);
            } else {
                api.addUserToGroup(uid, threadID, (err) => {
                    if (err) {
                        api.sendMessage(getLang('add.error.unknown'), threadID, messageID);
                    } else {
                        api.sendMessage(getLang('add.success', { targetID: uid }), threadID, messageID);
                    }
                });
            }
        }
    }

    return;
}

async function box({ api, event, args, getLang, controllers }) {
    const { threadID, messageID, senderID } = event;
    const { Threads } = controllers;
    const fs = libs['fs'];
    const input = args[0] ? args[0].toLowerCase() : '';
    if (input == '') {
        api.sendMessage(getLang('box.info.error.missingCommand'), threadID, messageID);
    } else {
        switch (input) {
            case 'info':
                {
                    const boxInfo = await api.getThreadInfo(threadID) || {};
                    if (Object.keys(boxInfo).length == 0) {
                        api.sendMessage(getLang('box.info.error.emptyInfo'), threadID, messageID);
                    } else {
                        let msg = {};

                        msg.body = getLang('box.info.body', {
                            name: boxInfo.threadName,
                            id: boxInfo.threadID,
                            admins: boxInfo.adminIDs.length,
                            members: boxInfo.participantIDs.length,
                            emoji: boxInfo.emoji,
                            approvalMode: boxInfo.approvalMode ? 'On' : 'Off'
                        }).replace(/^ +/gm, '');

                        let imgdir = client.mainPath + `/plugins/cache/${boxInfo.threadID}_${Date.now()}_info.png`;
                        if (boxInfo.imageSrc) {
                            await get(boxInfo.imageSrc, { responseType: 'arraybuffer' }).then(res => {
                                fs.writeFileSync(imgdir, res.data);
                            });
                            msg.attachment = fs.createReadStream(imgdir);
                        }
                        api.sendMessage(msg, threadID, (err, info) => {
                            if (err) console.log(err);
                            if (msg.hasOwnProperty('attachment')) {
                                fs.unlinkSync(imgdir);
                            }
                        }, messageID);
                    }
                }
                break;
            case 'filter':
                {
                    const boxInfo = await Threads.getInfoApi(threadID) || {};
                    if (Object.keys(boxInfo).length == 0) {
                        api.sendMessage(getLang('box.filter.error.emptyInfo'), threadID, messageID);
                    } else {
                        const { userInfo, adminIDs } = boxInfo;
                        if (!adminIDs.some(e => e.id == senderID)) {
                            api.sendMessage(getLang('box.filter.error.executorNotAdmin'), threadID, messageID);
                        } else if (!adminIDs.some(e => e.id == botID)) {
                            api.sendMessage(getLang('box.filter.error.botNotAdmin'), threadID, messageID);
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
                                    api.sendMessage(getLang('box.filter.success', { successCount }), threadID, messageID);
                                } else {
                                    api.removeUserFromGroup(deadAccounts.shift(), threadID, (err) => {
                                        if (err) {
                                            console.log(err);
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
                    let msg = getLang('box.settings.body', {
                        noChangeNickname: boxData.noChangeNickname ? 'On' : 'Off',
                        noChangeBoxName: boxData.noChangeBoxName ? 'On' : 'Off',
                        noChangeBoxImage: boxData.noChangeBoxImage ? 'On' : 'Off',
                        noUnsendMessage: boxData.noUnsendMessage ? 'On' : 'Off',
                        allowNSFW: boxData.nsfw ? 'On' : 'Off'
                    }).replace(/^ +/gm, '');

                    api.sendMessage(msg, threadID, (err, info) => {
                        if (err) console.log(err);
                        client.replies.push({
                            type: 'boxSettings',
                            threadID: threadID,
                            messageID: info.messageID,
                            author: senderID
                        })
                    }, messageID);
                }
                break;
            default:
                api.sendMessage(getLang('box.info.error.invalidCommand'), threadID, messageID);
                break;
        }
    }
    return;
}

function refresh({ api, event, getLang, controllers }) {
    const { threadID, messageID } = event;
    api.sendMessage(getLang('refresh.refreshing'), threadID, async () => {
        const threadObj = await controllers.Threads.getInfoApi(threadID) || {};
        if (Object.keys(threadObj).length == 0) {
            api.sendMessage(getLang('refresh.error.emptyInfo'), threadID, messageID);
        } else {
            api.sendMessage(getLang('refresh.success'), threadID, messageID);
        }
    });

    return;
}

async function tagAll({ api, event, args, controllers }) {
    const threadInfo = await controllers.Threads.getInfo(event.threadID) || {};

    if (!threadInfo.hasOwnProperty('participantIDs')) return;

    const participantIDs = threadInfo.participantIDs.filter(e => e != event.senderID && e != botID);
    const ptcpLength = participantIDs.length;
    const emptyChar = '\u200B';

    var msg = args.join(" "),
        mentions = [];

    for (let i = 0; i < ptcpLength; i++) {
        if (msg.length > i) msg += emptyChar;
        mentions.push({
            tag: msg[i],
            id: participantIDs[i]
        })
    }
    api.sendMessage({
        body: msg,
        mentions
    }, event.threadID);

    return;
}
