export default function ({ api, db, controllers }) {
    return async function ({ event }) {
        const { threadID, messageID, senderID, messageReply } = event;
        const isValidReply = messageReply && client.handleMaps.replies.has(messageReply.messageID);
        if (!isValidReply) return;


        const eventData = client.handleMaps.replies.get(messageReply.messageID);
        const pluginName = eventData.name;
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
            const executable = client.registeredMaps.replies.get(pluginName);
            await executable.execute({
                api,
                message: event,
                getLang: getLangForCommand,
                db,
                controllers,
                eventData
            });
        } catch (err) {
            console.error(err);
        }
    }
}
