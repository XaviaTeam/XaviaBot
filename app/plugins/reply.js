export default async function({ api, event, db, controllers, reply }) {
    const { threadID, messageID, body, args, senderID } = event;
    const { Threads, Users } = controllers;
    const { logger } = client.modules;

    switch (reply.type) {
        case 'pending': {
            if (senderID != reply.author) return;
            if (args.length == 0) return;
            const { list } = reply;
            const query = args[0] ? args[0].toLowerCase() : '';
            const chosenGroup = args.slice(1);
            if (chosenGroup.length == 0) {
                api.sendMessage('Missing input.', threadID, messageID);
                return;
            }

            let succeed = failed = [];
            if (query == 'approve') {
                for (const i of chosenGroup) {
                    if (i == NaN || isNaN(i)) continue;
                    if (i - 1 > list.length) continue;
                    const group = list[i - 1];
                    const getThread = await Threads.checkThread(group.threadID) || {};
                    const Prefix = getThread.data ? getThread.data.prefix : client.config.PREFIX;
                    api.sendMessage(
                        `Your group has been approved!\n\n${client.config.NAME} connected!\nUse ${Prefix}help to see all commands.`,
                        group.threadID,
                        (err) => {
                            if (err) {
                                failed.push(group.threadID);
                            } else succeed.push(group.threadID);;
                        }
                    );
                }
            } else if (query == 'reject') {
                for (const i of chosenGroup) {
                    if (i == NaN || isNaN(i)) continue;
                    if (i - 1 > list.length) continue;
                    const group = list[i - 1];
                    api.sendMessage(
                        `Your group has been rejected!`,
                        group.threadID,
                        (err) => {
                            if (err) {
                                failed.push(group.threadID);
                            } else api.removeUserFromGroup(
                                group.threadID,
                                botID,
                                (err) => {
                                    if (err) {
                                        failed.push(group.threadID);
                                    } else succeed.push(group.threadID);;
                                });
                        }
                    );
                }
            } else {
                return api.sendMessage(
                    'Invalid query, please use approve/reject',
                    threadID,
                    messageID
                )
            }
            api.unsendMessage(reply.messageID);
            let msg = query.charAt(0).toUpperCase() + query.slice(1) + 'ed' + succeed.length + ' group(s).';
            if (failed.length > 0) {
                msg += `\nFailed to ${query} ${failed.length} groups:\n${failed.join(', ')}`;
            }
            api.sendMessage(msg, threadID, messageID);
            break;
        }
        case 'boxSettings': {
            if (senderID != reply.author) return;
            if (args.length == 0) return;
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
                if (index == NaN || isNaN(index) || index < 1 || index > settingsQuery.length) {
                    failed.push(index);
                } else {
                    const setting = settingsQuery[index - 1];
                    if (!boxData.hasOwnProperty(setting)) {
                        boxData[setting] = true;
                    } else {
                        boxData[setting] = !boxData[setting];
                    }
                    succeed.push(`${setting} => ${boxData[setting] ? 'enabled' : 'disabled'}`);
                }
            }
            try {
                await Threads.setData(threadID, boxData);
                let msg = `» Box settings changed:\n` + succeed.map(e => `- ${e}`).join('\n');
                api.sendMessage(msg, threadID, () => {
                    api.unsendMessage(reply.messageID);
                }, messageID);
                
            } catch (err) {
                console.log(err);
            }
        }
        default:
            break;
    }
    return;
}
