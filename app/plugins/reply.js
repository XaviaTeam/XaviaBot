export default async function ({ api, event, db, controllers, reply }) {
    const { threadID, messageID, args, senderID } = event;
    const { Threads } = controllers;

    switch (reply.type) {
        case 'pending': {
            if (senderID != reply.author) return;
            if (args.length == 0) return;
            const { list } = reply;
            const query = args[0] ? args[0].toLowerCase() : '';
            const chosenGroup = args.slice(1);
            if (chosenGroup.length == 0) {
                api.sendMessage(getLang('plugins.reply.pending.error.invalidQuery'), threadID, messageID);
                return;
            }

            let succeed = [],
                failed = [],
                msg = null,
                promiseJobs = [];

            if (query == 'approve') {
                for (const i of chosenGroup) {
                    if (i == NaN || isNaN(i)) continue;
                    if (i - 1 > list.length) continue;
                    const group = list[i - 1];
                    const getThread = await Threads.checkThread(group.threadID) || {};
                    const Prefix = getThread.data.prefix || client.config.PREFIX;
                    promiseJobs.push(new Promise(async resolve => {
                        api.sendMessage(
                            getLang('plugins.reply.pending.approved', {
                                NAME: client.config.NAME,
                                PREFIX: Prefix
                            }),
                            group.threadID,
                            (err) => {
                                if (err) {
                                    console.error(err);
                                    failed.push(group.threadID);
                                } else succeed.push(group.threadID);
                                resolve();
                            }
                        );
                    }));
                }
            } else if (query == 'reject') {
                for (const i of chosenGroup) {
                    if (i == NaN || isNaN(i)) continue;
                    if (i - 1 > list.length) continue;
                    const group = list[i - 1];
                    promiseJobs.push(new Promise(async resolve => {
                        api.sendMessage(
                            getLang('plugins.reply.pending.rejected'),
                            group.threadID,
                            (err) => {
                                if (err) {
                                    failed.push(group.threadID);
                                } else api.removeUserFromGroup(
                                    group.threadID,
                                    botID,
                                    (err) => {
                                        if (err) {
                                            console.error(err);
                                            failed.push(group.threadID);
                                        } else succeed.push(group.threadID);
                                        resolve();
                                    });
                            }
                        );
                    }));
                }
            } else {
                return api.sendMessage(
                    getLang('plugins.reply.pending.error.invalidQuery'),
                    threadID,
                    messageID
                )
            }

            Promise.all(promiseJobs).then(() => {
                msg = getLang(`plugins.reply.pending.${query}.success`, {
                    SUCCEED: succeed.length,
                    SUCCEED_LIST: succeed.join('\n'),
                });
                if (failed.length > 0) msg += `\n${getLang(`plugins.reply.pending.${query}.failed`, {
                    FAILED: failed.length,
                    FAILED_LIST: failed.join('\n')
                })}`;

                api.unsendMessage(reply.messageID);
                api.sendMessage(msg, threadID, messageID);
            });
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
                    succeed.push(`${setting} => ${boxData[setting] ? getLang('enabled') : getLang('disabled')}`);
                }
            }
            try {
                await Threads.setData(threadID, boxData);
                let msg = getLang('plugins.reply.boxsettings.success', {
                    SETTINGS: succeed.map(e => `- ${e}`).join('\n'),
                });
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
