import { Assets } from "./assets.js";
import { Balance } from "./balance.js";

var resend;

function checkBanStatus(data = {}, userID) {
    if (
        data?.user?.banned === true ||
        data?.thread?.banned === true ||
        data?.thread?.info?.members?.find((e) => e.userID == userID)?.banned === true
    )
        return true;

    return false;
}

function getExtraEventProperties(event, { type, commandName }) {
    const { api } = global;
    const { threadID, messageID, senderID, userID } = event;
    const isReaction = type === "reaction";
    const extraEventProperties = {
        send: function (message, c_threadID = null, c_messageID = null) {
            return new Promise((resolve, reject) => {
                const targetSendID = c_threadID || threadID;
                api.sendMessage(
                    message,
                    targetSendID,
                    (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(messageFunctionCallback(data, targetSendID));
                        }
                    },
                    c_messageID || null
                );
            });
        },
        reply: function (message) {
            return new Promise((resolve, reject) => {
                api.sendMessage(
                    message,
                    threadID,
                    (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(messageFunctionCallback(data, threadID));
                        }
                    },
                    messageID
                );
            });
        },
        react: function (emoji) {
            return new Promise((resolve, reject) => {
                api.setMessageReaction(
                    emoji,
                    messageID,
                    (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    },
                    true
                );
            });
        },
    };

    if (isReaction) {
        delete extraEventProperties.reply;
        delete extraEventProperties.react;
    }

    const messageFunctionCallback = (data, targetSendID) => {
        const baseInput = {
            threadID: targetSendID,
            messageID: data.messageID,
            author: isReaction ? userID : senderID,
            author_only: true,
            name: commandName,
        };

        data.addReplyEvent = function (data = {}, standbyTime = 60000) {
            if (typeof data !== "object" || Array.isArray(data)) return;
            if (typeof data.callback !== "function") return;

            const input = Object.assign(baseInput, data);
            global.client.replies.set(input.messageID, input);
            if (standbyTime > 0) {
                setTimeout(() => {
                    if (global.client.replies.has(input.messageID)) {
                        global.client.replies.delete(input.messageID);
                    }
                }, standbyTime);
            }
        };
        data.addReactEvent = function (data = {}, standbyTime = 60000) {
            if (typeof data !== "object" || Array.isArray(data)) return;
            if (typeof data.callback !== "function") return;

            const input = Object.assign(baseInput, data);
            global.client.reactions.set(input.messageID, input);
            if (standbyTime > 0) {
                setTimeout(() => {
                    if (global.client.reactions.has(input.messageID)) {
                        global.client.reactions.delete(input.messageID);
                    }
                }, standbyTime);
            }
        };
        data.unsend = function (delay = 0) {
            const input = Object.assign(baseInput, data);
            setTimeout(
                () => {
                    api.unsendMessage(input.messageID);
                },
                delay > 0 ? delay : 0
            );
        };

        return data;
    };

    return extraEventProperties;
}

function findCommand(commandName) {
    const commandsAliases = global.plugins.commandsAliases;
    const commands = global.plugins.commands;

    if (commands.has(commandName)) return commandName;

    for (const [command, alias] of commandsAliases) {
        if (alias.includes(commandName)) return command;
    }

    return null;
}

function getUserPermissions(userID, _thread) {
    const { MODERATORS } = global.config;
    const adminIDs = _thread?.adminIDs || [];

    let permissions = [0];

    if (adminIDs.some((e) => e == userID)) permissions.push(1);
    if (MODERATORS.includes(userID)) permissions.push(2);

    return permissions;
}

function checkPermission(permissions, userPermissions) {
    if (permissions.length === 0 || userPermissions.length === 0) return false;

    return permissions.some((permission) => userPermissions.includes(permission));
}

/**
 *
 * @param {TMessageObject} event
 * @param {xDatabase} xDatabase
 * @returns
 */
async function handleCommand(event, xDatabase) {
    const { threadID, messageID, senderID, args } = event;
    const { Threads, Users } = xDatabase.controllers;
    const _thread = event.isGroup === true ? await Threads.get(threadID) : null;
    const _user = await Users.get(senderID);

    const data = { thread: _thread, user: _user };
    if (checkBanStatus(data, senderID)) return;

    const prefix = (_thread?.data?.prefix || global.config.PREFIX || "x").trim().toLowerCase();

    if (args.length > 0 && args[0].startsWith(prefix)) {
        const { api, getLang } = global;
        const commandName = findCommand(args[0].slice(prefix.length)?.toLowerCase());
        const command = global.plugins.commands.get(commandName) || null;
        const commandInfo = global.plugins.commandsConfig.get(commandName);

        if (command !== null) {
            const { cooldowns } = global.client;
            const permissions = commandInfo.permissions || [0];
            const userPermissions = getUserPermissions(senderID, _thread?.info);
            const isAbsoluteUser = global.config?.ABSOLUTES.some((e) => e == senderID);
            const checkAbsolute = !!commandInfo.isAbsolute ? isAbsoluteUser : true;
            const isValidUser = checkPermission(permissions, userPermissions) && checkAbsolute;

            if (isValidUser) {
                const userCooldown = cooldowns.get(senderID) || {};
                const isReady =
                    !userCooldown[commandName] ||
                    Date.now() - userCooldown[commandName] >= (commandInfo.cooldown || 3) * 1000;

                if (isReady) {
                    const isNSFWEnabled = _thread?.data?.nsfw === true;
                    const isCommandNSFW = commandInfo.nsfw === true;

                    if (
                        (isNSFWEnabled && isCommandNSFW) ||
                        !isCommandNSFW ||
                        event.isGroup === false
                    ) {
                        userCooldown[commandName] = Date.now();
                        cooldowns.set(senderID, userCooldown);

                        let TLang = _thread?.data?.language || global.config.LANGUAGE || "en_US";
                        const getLangForCommand = (key, objectData) =>
                            getLang(key, objectData, commandName, TLang);

                        const extraEventProperties = getExtraEventProperties(event, {
                            type: "command",
                            commandName,
                        });
                        Object.assign(event, extraEventProperties);

                        const extra = commandInfo.extra || {};
                        const assets = Assets.gI();

                        try {
                            command({
                                message: event,
                                args: args.slice(1),
                                assets: {
                                    from: assets.from,
                                    ...assets.from(commandInfo.name),
                                },
                                balance: {
                                    from: Balance.from,
                                    make: Balance.make,
                                    makeSafe: Balance.makeSafe,
                                    ...Balance.from(senderID),
                                },
                                getLang: getLangForCommand,
                                extra,
                                data,
                                xDB: xDatabase,
                                userPermissions,
                                prefix,
                            });
                        } catch (err) {
                            console.error(err);
                            api.sendMessage(
                                getLang("handlers.default.error", {
                                    error: String(err.message || err),
                                }),
                                threadID,
                                messageID
                            );
                        }
                    } else {
                        api.sendMessage(
                            getLang("handlers.commands.nsfwNotAllowed"),
                            threadID,
                            messageID
                        );
                    }
                } else {
                    api.setMessageReaction("🕓", messageID, null, true);
                }
            } else {
                // Do something when user don't have enough permissions
                // Làm gì đó khi người dùng không có đủ quyền hạn
            }
        } else {
            // Do something when command not found
            // Làm gì đó khi không tìm thấy lệnh
        }
    }
}

/**
 *
 * @param {TReactionObject} event
 * @param {xDatabase} xDatabase
 * @returns
 */
async function handleReaction(event, xDatabase) {
    const { threadID, messageID, userID } = event;
    const { Threads, Users } = xDatabase.controllers;
    let isValidReaction = global.client.reactions.has(messageID);

    if (isValidReaction) {
        const _thread =
            event.senderID != event.threadID && event.userID != event.threadID
                ? await Threads.get(threadID)
                : null;
        const _user = await Users.get(userID);

        const data = { user: _user, thread: _thread };
        if (checkBanStatus(data, userID)) return;

        const { api, getLang } = global;
        const eventData = global.client.reactions.get(messageID);
        const commandName = eventData.name;

        if (eventData.author_only === true && eventData.author !== userID) return;

        let TLang = _thread?.data?.language || global.config.LANGUAGE || "en_US";
        const getLangForCommand = (key, objectData) => getLang(key, objectData, commandName, TLang);

        const extraEventProperties = getExtraEventProperties(event, {
            type: "reaction",
            commandName,
        });
        Object.assign(event, extraEventProperties);

        const _eventData = Object.assign({}, eventData);
        delete _eventData.callback;

        try {
            eventData.callback({
                message: event,
                assets: { from: Assets.gI().from, ...Assets.gI().from(eventData.name) },
                balance: {
                    from: Balance.from,
                    make: Balance.make,
                    makeSafe: Balance.makeSafe,
                    ...Balance.from(userID),
                },
                getLang: getLangForCommand,
                data,
                xDB: xDatabase,
                eventData: _eventData,
            });
        } catch (err) {
            console.error(err);
            api.sendMessage(
                getLang("handlers.default.error", {
                    error: String(err.message || err),
                }),
                threadID,
                messageID
            );
        }
    }
}

/**
 *
 * @param {TMessageReplyObject} event
 * @param {xDatabase} xDatabase
 * @returns
 */
async function handleReply(event, xDatabase) {
    const { threadID, messageID, senderID, messageReply } = event;
    if (!messageReply) return;
    const { Threads, Users } = xDatabase.controllers;
    let isValidReply = global.client.replies.has(messageReply.messageID);

    if (isValidReply) {
        const _thread = event.isGroup === true ? await Threads.get(threadID) : null;
        const _user = await Users.get(senderID);

        const data = { user: _user, thread: _thread };
        if (checkBanStatus(data, senderID)) return;

        const { api, getLang } = global;
        const eventData = global.client.replies.get(messageReply.messageID);
        const commandName = eventData.name;

        if (eventData.author_only === true && eventData.author !== senderID) return;

        let TLang = _thread?.data?.language || global.config.LANGUAGE || "en_US";
        const getLangForCommand = (key, objectData) => getLang(key, objectData, commandName, TLang);

        const extraEventProperties = getExtraEventProperties(event, {
            type: "reply",
            commandName,
        });
        Object.assign(event, extraEventProperties);

        const _eventData = Object.assign({}, eventData);
        delete _eventData.callback;

        try {
            eventData.callback({
                message: event,
                assets: { from: Assets.gI().from, ...Assets.gI().from(eventData.name) },
                balance: {
                    from: Balance.from,
                    make: Balance.make,
                    makeSafe: Balance.makeSafe,
                    ...Balance.from(senderID),
                },
                getLang: getLangForCommand,
                data,
                xDB: xDatabase,
                eventData: _eventData,
            });
        } catch (err) {
            console.error(err);
            api.sendMessage(
                getLang("handlers.default.error", {
                    error: String(err.message || err),
                }),
                threadID,
                messageID
            );
        }
    }
}

/**
 *
 * @param {TMessageObject} event
 * @param {xDatabase} xDatabase
 * @returns
 */
async function handleMessage(event, xDatabase) {
    const { api, getLang } = global;
    const { threadID, senderID } = event;
    const { Threads, Users } = xDatabase.controllers;

    const _thread = event.isGroup === true ? await Threads.get(threadID) : null;
    const _user = await Users.get(senderID);

    const data = { user: _user, thread: _thread };
    if (checkBanStatus(data, senderID)) return;

    for (const [name, callback] of global.plugins.onMessage.entries()) {
        try {
            let TLang = _thread?.data?.language || global.config.LANGUAGE || "en_US";
            const getLangForCommand = (key, objectData) => getLang(key, objectData, name, TLang);
            const extraEventProperties = getExtraEventProperties(event, {
                type: "message",
                commandName: name,
            });
            Object.assign(event, extraEventProperties);

            callback({
                message: event,
                assets: { from: Assets.gI().from },
                balance: {
                    from: Balance.from,
                    make: Balance.make,
                    makeSafe: Balance.makeSafe,
                    ...Balance.from(senderID),
                },
                getLang: getLangForCommand,
                data,
                xDB: xDatabase,
            });
        } catch (err) {
            console.error(err);
        }
    }
}

function handleUnsend(event) {
    if (event.senderID == event.threadID || global.botID == event.threadID) return;
    resend.default({ event });
}

/**
 *
 * @param {TEventObject} event
 */
function handleEvent(event) {
    try {
        switch (event.type) {
            case "event": {
                switch (event.logMessageType) {
                    case "log:subscribe":
                        global.plugins.events.get("subscribe")?.({ event });
                        break;
                    case "log:unsubscribe":
                        global.plugins.events.get("unsubscribe")?.({ event });
                        break;
                    case "log:user-nickname":
                        global.plugins.events.get("user-nickname")?.({ event });
                        break;
                    case "log:thread-call":
                        global.plugins.events.get("thread-call")?.({ event });
                        break;
                    case "log:thread-name":
                    case "log:thread-color":
                    case "log:thread-icon":
                    case "log:thread-approval-mode":
                    case "log:thread-admins":
                        global.plugins.events.get("thread-update")?.({ event });
                        break;
                    case "log:thread-image":
                        global.plugins.events.get("thread-image")?.({ event });
                        break;
                    default:
                        break;
                }
                break;
            }
            // deprecated, using log:thread-image instead
            case "change_thread_image":
                global.plugins.events.get("thread-image")?.({ event });
                break;
            default:
                break;
        }
    } catch (err) {
        console.error(err);
    }
}

export default async function () {
    resend = await import("../../plugins/resend.js");

    return {
        handleCommand,
        handleReaction,
        handleReply,
        handleMessage,
        handleUnsend,
        handleEvent,
    };
}
