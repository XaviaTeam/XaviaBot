export default function ({ api, db, controllers }) {
    const { Users, Threads } = controllers;
    return async function ({ event }) {
        const { threadID, messageID, body, args, senderID } = event;
        const threadData = await Threads.getData(threadID) || {};

        const PREFIX = threadData.prefix || client.config.PREFIX;
        if (!body.startsWith(PREFIX)) {
            return;
        }
        
        const args_prefix_removed = args.join(" ").slice(PREFIX.length).split(" ");
        const alias = args_prefix_removed[0]?.toLowerCase(); 
        const commandArgs = args_prefix_removed?.slice(1); 

        const command = getKeyByValue(alias, client.registeredMaps.commandsAliases);

        if (client.registeredMaps.commandsInfo.has(command)) {
            const threadInfo = await Threads.getInfo(threadID) || {};
            if (!client.data.userIDs.some(id => id == senderID)) {
                await Users.getInfo(senderID) || {};
            }
            const threadAdminIDs = threadInfo.adminIDs || [];
            const botModeratorIDs = client.config.MODERATORS || [];

            const commandData = client.registeredMaps.commandsInfo.get(command);
            if (commandData.nsfw == true && threadData.nsfw == false) { 
                api.sendMessage(getLang("handlers.commands.nsfwNotAllowed"), threadID, messageID);
                return;
            }

            let userPermissions = [0]; 
            if (threadAdminIDs.some(e => e.id == senderID)) {
                userPermissions = [0, 1];
            };
            if (botModeratorIDs.some(e => e == senderID) && !threadAdminIDs.some(e => e.id == senderID)) {
                userPermissions = [0, 2]
            };
            if (botModeratorIDs.some(e => e == senderID) && threadAdminIDs.some(e => e.id == senderID)) {
                userPermissions = [0, 1, 2];
            };

            if (!commandData.permissions.some(e => userPermissions.some(e2 => e2 == e))) {
                return;
            }
            if (client.handleMaps.commandsCooldowns.has(senderID)) {
                const userCommandsCooldowns = client.handleMaps.commandsCooldowns.get(senderID);
                if (userCommandsCooldowns.has(command)) {
                    const timeLeft = Date.now() - userCommandsCooldowns.get(command);
                    if (timeLeft < commandData.cooldown * 1000) {
                        return api.setMessageReaction(
                            '🕓',
                            messageID,
                            null, 
                            true
                        )
                    }
                }
            }

            if (!client.handleMaps.commandsCooldowns.has(senderID)) {
                client.handleMaps.commandsCooldowns.set(senderID, new Map());
            }

            client.handleMaps.commandsCooldowns.set(senderID, client.handleMaps.commandsCooldowns.get(senderID).set(command, Date.now()));

            const pluginName = getKeyByValue(command, client.plugins); 
            const getLangForCommand = (key, objectData) => getLang(key, objectData, pluginName);

            const extraEventProperties = { 
                send: function (message, DM = false) {
                    return new Promise((resolve, reject) => {
                        const targetSendID = DM ? senderID : threadID;
                        api.sendMessage(message, targetSendID, (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(messageFunctionCallback(data, targetSendID));
                            }
                        })
                    })
                },
                reply: function (message) {
                    return new Promise((resolve, reject) => {
                        api.sendMessage(message, threadID, (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(messageFunctionCallback(data, threadID));
                            }
                        }, messageID);
                    })
                },
                react: function (emoji) {
                    return new Promise((resolve, reject) => {
                        api.setMessageReaction(emoji, messageID, (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data);
                            }
                        }, true);
                    })
                }
            }

            const messageFunctionCallback = (data, targetSendID) => {
                const baseInput = {
                    threadID: targetSendID,
                    messageID: data.messageID,
                    author: senderID,
                    name: pluginName
                };

                data.addReplyEvent = function (data = {}, standbyTime = 60000) {
                    if (typeof data !== 'object' || Array.isArray(data)) {
                        data = {};
                    }

                    const input = Object.assign(baseInput, data);
                    client.handleMaps.replies.set(input.messageID, input);
                    if (standbyTime > 0) {
                        setTimeout(() => {
                            if (client.handleMaps.replies.has(input.messageID)) {
                                client.handleMaps.replies.delete(input.messageID);
                            }
                        }, standbyTime);
                    }
                }
                data.addReactionEvent = function (data = {}, standbyTime = 60000) {
                    if (typeof data !== 'object' || Array.isArray(data)) {
                        data = {};
                    }

                    const input = Object.assign(baseInput, data);
                    client.handleMaps.reactions.set(input.messageID, input);
                    if (standbyTime > 0) {
                        setTimeout(() => {
                            if (client.handleMaps.reactions.has(input.messageID)) {
                                client.handleMaps.reactions.delete(input.messageID);
                            }
                        }, standbyTime);
                    }
                }
                data.unsend = function (delay = 0) {
                    setTimeout(() => {
                        api.unsendMessage(input.messageID);
                    }, delay > 0 ? delay : 0);
                }

                return data;
            }

            Object.assign(event, extraEventProperties); 
            
            try {
                await client.registeredMaps.commandsExecutable.get(command)({
                    api,
                    message: event,
                    args: commandArgs,
                    getLang: getLangForCommand,
                    db,
                    controllers,
                    userPermissions,
                    prefix: PREFIX 
                });
            } catch (err) {
                console.error(err);
                api.sendMessage(
                    getLang('handlers.commands.error'),
                    threadID,
                    messageID
                );
            }
        }
    }
}

function getKeyByValue(targetKey, targetMap) {
    for (const [key, value] of targetMap) {
        if (value.some(e => e == targetKey)) {
            return key;
        }
    }
}
