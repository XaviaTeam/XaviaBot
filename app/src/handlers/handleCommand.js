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
        const command = args_prefix_removed[0].toLowerCase();
        const commandArgs = args_prefix_removed.slice(1);

        if (client.commands.has(command)) {
            const threadInfo = await Threads.getInfo(threadID) || {};
            if (!client.data.userIDs.some(id => id == senderID)) {
                await Users.getInfo(senderID) || {};
            }
            const threadAdminIDs = threadInfo.adminIDs || [];
            const botModeratorIDs = client.config.MODERATORS || [];

            const commandData = client.commands.get(command);
            if (commandData.nsfw == true) {
                if (threadData.nsfw == false) {
                    api.sendMessage(getLang("handlers.commands.nsfwNotAllowed"), threadID, messageID);
                    return;
                }
            }

            var userPermission = 0;
            if (threadAdminIDs.some(e => e.id == senderID)) {
                userPermission = 1;
            };
            if (botModeratorIDs.includes(senderID) && !threadAdminIDs.some(e => e == senderID)) {
                userPermission = 2;
            };
            if (botModeratorIDs.includes(senderID) && threadAdminIDs.some(e => e == senderID)) {
                userPermission = [1, 2];
            };


            if (!Array.isArray(commandData.permissions)) {
                commandData.permissions = [commandData.permissions];
            };
            if (Array.isArray(userPermission)) {
                if (!commandData.permissions.some(e => userPermission.includes(e))) {
                    api.sendMessage(
                        getLang('handlers.commands.noPermission'),
                        threadID,
                        messageID
                    );
                    return;
                }
            } else if (!commandData.permissions.includes(userPermission)) {
                api.sendMessage(
                    getLang('handlers.commands.noPermission'),
                    threadID,
                    messageID
                );
                return;
            }
            if (client.commandCooldowns.has(senderID)) {
                const cooldownList = client.commandCooldowns.get(senderID);
                if (cooldownList.has(command)) {
                    const timeLeft = Date.now() - cooldownList.get(command);
                    if (timeLeft < commandData.cooldown * 1000) {
                        return api.setMessageReaction(
                            '🕓',
                            messageID,
                            () => { },
                            true
                        )
                    }
                }
            }
            //set cooldown
            if (!client.commandCooldowns.has(senderID)) {
                client.commandCooldowns.set(senderID, new Map());
            }

            client.commandCooldowns.set(senderID, client.commandCooldowns.get(senderID).set(command, Date.now()));


            const getModuleName = (command) => {
                for (const [key, value] of client.commandModules) {
                    if (value.includes(command)) {
                        return key;
                    }
                }
            }
            const moduleName = getModuleName(command);
            const getLangForCommand = (key, objectData) => getLang(key, objectData, moduleName);

            //run command
            try {
                await commandData.execute({
                    api,
                    event,
                    args: commandArgs,
                    getLang: getLangForCommand,
                    db,
                    controllers,
                    userPermission
                });
            } catch (err) {
                console.log(err);
                api.sendMessage(
                    getLang('handlers.commands.error'),
                    threadID,
                    messageID
                );
            }
        }
    }
}
