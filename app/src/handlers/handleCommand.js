//Should i make it reply "noCommand" if the command is not found?

const text = {
    // "noCommand": "No command found. Type %1help for a list of commands.",
    "nsfwNotAllowed": "This thread doesn't allow nsfw commands.",
    "noPermission": "You do not have permission to use this command.",
    "cooldown": "You can use this command again in %1 seconds.",
    "error": "An error occurred while executing this command.",
    "underMaintenance": "The bot is currently under maintenance. Please try again later."
}

const getText = (key, ...args) => {
    if (text[key]) {
        return text[key].replace(/%(\d+)/g, (match, p1) => args[p1 - 1]);
    }
    return key;
}

export default function ({ api, db, controllers }) {
    const { Users, Threads } = controllers;
    return async function ({ event }) {
        const { threadID, messageID, body, args, senderID } = event;
        const threadData = await Threads.getData(threadID) || {};

        const PREFIX = threadData.prefix || client.config.PREFIX;
        if (!body.startsWith(PREFIX)) {
            return;
        }
        const command = args.shift().slice(PREFIX.length).toLowerCase();
        const commandArgs = args;

        if (client.commands.has(command)) {
            const threadInfo = await Threads.getInfo(threadID) || {};
            if (!client.data.userIDs.some(id => id == senderID)) {
                await Users.getInfo(senderID) || {};
            }
            const threadAdminIDs = threadInfo.adminIDs || [];
            const botAdminIDs = client.config.ADMINS || [];

            const commandData = client.commands.get(command);
            if (commandData.nsfw == true) {
                if (threadData.nsfw == false) {
                    api.sendMessage(getText("nsfwNotAllowed"), threadID, messageID);
                    return;
                }
            }

            var userPermission = 0;
            if (threadAdminIDs.some(e => e.id == senderID)) {
                userPermission = 1;
            };
            if (botAdminIDs.includes(senderID) && !threadAdminIDs.some(e => e == senderID)) {
                userPermission = 2;
            };
            if (botAdminIDs.includes(senderID) && !threadAdminIDs.some(e => e == senderID)) {
                userPermission = [1, 2];
            };

            if (client.maintenance == true && !client.data.monitorServers.includes(threadID))
                if (userPermission != 2 && userPermission != [1, 2] && command != 'maintenance' && command != 'setMonitor')
                    return api.sendMessage(
                        getText('underMaintenance'),
                        threadID
                    );

            if (!Array.isArray(commandData.permissions)) {
                commandData.permissions = [commandData.permissions];
            };
            if (Array.isArray(userPermission)) {
                if (!commandData.permissions.some(e => userPermission.includes(e))) {
                    api.sendMessage(
                        getText('noPermission'),
                        threadID,
                        messageID
                    );
                    return;
                }
            } else if (!commandData.permissions.includes(userPermission)) {
                api.sendMessage(
                    getText('noPermission'),
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
                            () => {},
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

            //run command
            try {
                await commandData.execute({
                    api,
                    event,
                    args: commandArgs,
                    db,
                    controllers,
                    userPermission
                });
            } catch (err) {
                console.log(err);
                api.sendMessage(
                    getText('error'),
                    threadID,
                    messageID
                );
            }
        }
        // else {
        //     api.sendMessage(
        //         getText('noCommand', PREFIX),
        //         threadID,
        //         messageID
        //     );
        // }
    }
}
