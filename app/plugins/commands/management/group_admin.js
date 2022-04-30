'use strict';
export const config = {
    name: "BoxAdminManager",
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
        "kick": kick,
        "add": add,
        "box": box,
        "refresh": refresh,
        "all": tagAll
    },
    dependencies: [
        'axios',
        'fs'
    ],
    cooldown: {
        "kick": 10,
        "add": 10,
        "box": 10,
        "refresh": 60 * 60 * 12,
        "all": 10
    }
}

async function kick({ api, event, controllers }) {
    const { threadID, messageID, mentions, senderID, messageReply } = event;
    if (Object.keys(mentions).length == 0 && event.type != 'message_reply') {
        return api.sendMessage("Please tag a user or reply to a user", threadID);
    } else {
        const threadInfo = await controllers.Threads.getInfo(threadID) || {};
        if (Object.keys(threadInfo).length == 0) {
            return api.sendMessage("Can't execute this command now.", threadID, messageID);
        }
        const { adminIDs } = threadInfo;
        if (!adminIDs.some(e => e.id == senderID)) {
            return api.sendMessage("You are not admin of this group", threadID, messageID);
        }
        if (!adminIDs.some(e => e.id == botID)) {
            return api.sendMessage("I am not admin of this group", threadID, messageID);
        }
        const targetID = event.type == 'message_reply' ? messageReply.senderID : Object.keys(mentions)[0];
        if (targetID == botID) {
            return api.sendMessage("I won't kick myself lol", threadID);
        } else {
            const targetName = await controllers.Users.getName(targetID);
            api.removeUserFromGroup(targetID, threadID, (err) => {
                if (err) {
                    api.sendMessage("I can't kick this user\nTry refresh commands..", threadID, messageID);
                } else {
                    api.sendMessage(`${targetName} has been kicked`, threadID);
                }
            });
        }
    }
    return;
}

async function add({ api, event }) {
    const { threadID, messageID, args } = event;
    const input = args[0] || '';
    if (input == '') {
        return api.sendMessage("Please input a user's uid or profile link", threadID, messageID);
    }
    let uid = input.match(/(?:(?:http|https):\/\/)?(?:www.|m.)?facebook.com\/(?!home.php)(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\.-]+)/)[1];
    if (isNaN(uid)) {
        uid = (await api.getUserID(uid))[0].userID;
    }
    
    if (!uid || isNaN(uid)) {
        return api.sendMessage("Invalid profile link", threadID, messageID);
    } else {
        if (uid == botID) {
            return api.sendMessage('Why would I add myself?', threadID, messageID);
        } else {
            api.addUserToGroup(uid, threadID, (err) => {
                if (err) {
                    api.sendMessage("I can't add this user\nMaybe I am not this group's admin or this user is already in this group", threadID, messageID);
                } else {
                    api.sendMessage(`${uid} has been added`, threadID);
                }
            });
        }
    }
    return;
}

async function box({ api, event, controllers }) {
    const { threadID, messageID, args, senderID } = event;
    const { Threads, Users } = controllers;
    const fs = libs['fs'];
    const input = args[0] ? args[0].toLowerCase() : '';
    if (input == '') {
        return api.sendMessage("Please input a command", threadID, messageID);
    }
    switch (input) {
        case 'info':
            {
                const boxInfo = await api.getThreadInfo(threadID) || {};
                if (Object.keys(boxInfo).length == 0) {
                    api.sendMessage("Can't get info of this box", threadID, messageID);
                } else {
                    let msg = {};
                    msg.body = `
                    Name: ${boxInfo.threadName}
                    ID: ${boxInfo.threadID}
                    Admins: ${boxInfo.adminIDs.length}
                    Members: ${boxInfo.participantIDs.length}
                    Emoji: ${boxInfo.emoji}
                    Approval Mode: ${boxInfo.approvalMode ? 'On' : 'Off'}
                    `.replace(/^ +/gm, '');

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
                    api.sendMessage("Can't execute this command now.", threadID, messageID);
                } else {
                    const { userInfo, adminIDs } = boxInfo;
                    if (!adminIDs.some(e => e.id == senderID)) {
                        api.sendMessage("You are not admin of this group", threadID, messageID);
                    } else if (!adminIDs.some(e => e.id == botID)) {
                        api.sendMessage("I am not admin of this group", threadID, messageID);
                    } else {
                        const deadAccounts = [];
                        for (const user of userInfo) {
                            if (!user.hasOwnProperty('gender') || user.gender == undefined) {
                                deadAccounts.push(user.id);
                            }
                        }

                        const interval = setInterval(() => {
                            if (deadAccounts.length == 0) {
                                clearInterval(interval);
                                api.sendMessage("All dead accounts has been removed", threadID, messageID);
                            } else {
                                api.removeUserFromGroup(deadAccounts.shift(), threadID, (err) => {
                                    if (err) {
                                        console.log(err);
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
                api.sendMessage(`
                -» Box Settings
                1. No Change Nickname: ${boxData.noChangeNickname ? 'On' : 'Off' || 'Off'}
                2. No Change Box Name: ${boxData.noChangeBoxName ? 'On' : 'Off' || 'Off'}
                3. No Change Box Image: ${boxData.noChangeBoxImage ? 'On' : 'Off' || 'Off'}
                4. No Unsend Message: ${boxData.resend ? 'On' : 'Off' || 'Off'}
                5. Allow NSFW: ${boxData.nsfw ? 'On' : 'Off' || 'Off'}
                -» Reply with any of the above numbers to change the setting (true/false).
                `.replace(/^ +/gm, ''), threadID, (err, info) => {
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
            api.sendMessage("Invalid command", threadID, messageID);
            break;
    }
    return;
}

function refresh({ api, event, controllers }) {
    const { threadID, messageID } = event;
    return api.sendMessage("Refreshing box info...", threadID, async () => {
        const threadObj = await controllers.Threads.getInfoApi(threadID) || {};
        if (Object.keys(threadObj).length == 0) {
            return api.sendMessage("Can't refresh this box", threadID, messageID);
        } else {
            return api.sendMessage("Refreshed", threadID, messageID);
        }
    });
}

async function tagAll({ api, event, args, controllers }) {
    const threadInfo = await controllers.Threads.getInfo(event.threadID) || {};
    if (!threadInfo.hasOwnProperty('participantIDs')) return;
    const participantIDs = threadInfo.participantIDs.filter(e => e != event.senderID && e != botID);
    var msg = args.join(" "),
        mentions = [];
    const emptyChar = '\u200B';
    let ptcpLength = participantIDs.length;
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
