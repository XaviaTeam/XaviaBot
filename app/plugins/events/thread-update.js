export default async function ({ api, event, db, controllers }) {
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = controllers;
    const getThread = await Threads.checkThread(threadID) || {};
    const getThreadData = getThread.data;
    const getThreadInfo = getThread.info || {};
    const getMonitorServerPerThread = client.data.monitorServerPerThread;

    let monitorID = null,
        atlertMsg = null;

    if (Object.keys(getThreadInfo).length === 0) return;
    switch (event.logMessageType) {
        case "log:thread-name":
            {
                const oldName = getThreadInfo.name;
                const newName = logMessageData.name;
                let smallCheck = false;

                atlertMsg = '"_author_" has changed group name to "_new_"';
                if (getThreadData.noChangeBoxName == true) {
                    const isBot = author == botID;
                    const isReversing = client.data.temps.some(i => i.type == 'noChangeBoxName' && i.threadID == threadID);
                    if (!(isBot && isReversing)) {
                        client.data.temps.push({ type: 'noChangeBoxName', threadID: threadID });
                        atlertMsg += '\nGroup does not allow name change so it has been ignored.';
                        api.setTitle(oldName, threadID, () => {
                            client.data.temps.splice(client.data.temps.indexOf({ type: 'noChangeBoxName', threadID: threadID }), 1);
                        });
                    } else if (isBot) {
                        smallCheck = true;
                    }
                } else {
                    getThreadInfo.name = newName;
                    const allThreads = await Threads.getAll();
                    const threadIndex = allThreads.findIndex(e => e.id == threadID);
                    allThreads[threadIndex].info = getThreadInfo;
                    await db.set('threads', allThreads);
                }
                if (!smallCheck && getMonitorServerPerThread[threadID]) {
                    const authorName = await Users.getName(author);
                    atlertMsg = atlertMsg.replace('_author_', `${authorName}`).replace('_new_', newName);
                    monitorID = getMonitorServerPerThread[threadID];
                }
            }
            break;
        case "log:thread-color":
        case "log:thread-icon":
            {
                const oldColor = getThreadInfo.color;
                if (logMessageData.hasOwnProperty('thread_color') || logMessageData.hasOwnProperty('theme_color')) {
                    const newColor = (logMessageData.thread_color || logMessageData.theme_color).slice(2);
                    const allThreads = await Threads.getAll();
                    const threadIndex = allThreads.findIndex(e => e.id == threadID);
                    allThreads[threadIndex].info.color = newColor;
                    await db.set('threads', allThreads);
                    if (getMonitorServerPerThread[threadID]) {
                        const authorName = await Users.getName(author);

                        atlertMsg = '"_author_" has changed group color from "_old_" to "_new_"';
                        atlertMsg = atlertMsg.replace('_author_', `${authorName}`).replace('_old_', oldColor).replace('_new_', newColor);
                        if (logMessageData.hasOwnProperty('theme_name_with_subtitle')) {
                            atlertMsg += `\n • Theme: ${logMessageData.theme_name_with_subtitle}`;
                        }
                        monitorID = getMonitorServerPerThread[threadID];
                    }
                }
                const oldEmoji = getThreadInfo.emoji;
                if (logMessageData.hasOwnProperty('thread_icon') || logMessageData.hasOwnProperty('theme_emoji')) {
                    const newEmoji = logMessageData.thread_icon || logMessageData.theme_emoji;
                    const allThreads = await Threads.getAll();
                    const threadIndex = allThreads.findIndex(e => e.id == threadID);

                    atlertMsg = '"_author_" has changed group emoji from "_old_" to "_new_"';
                    allThreads[threadIndex].info.emoji = newEmoji;
                    await db.set('threads', allThreads);
                    if (getMonitorServerPerThread[threadID]) {
                        const authorName = await Users.getName(author);
                        atlertMsg = atlertMsg.replace('_author_', `${authorName}`).replace('_old_', oldEmoji).replace('_new_', newEmoji);
                        monitorID = getMonitorServerPerThread[threadID];
                    }
                }
            }
            break;
        case "log:thread-approval-mode":
            {
                getThreadInfo.approvalMode = logMessageData.APPROVAL_MODE == 0 ? false : true;
                const allThreads = await Threads.getAll();
                const threadIndex = allThreads.findIndex(e => e.id == threadID);
                allThreads[threadIndex].info = getThreadInfo;
                await db.set('threads', allThreads);
                if (getMonitorServerPerThread[threadID]) {
                    const authorName = await Users.getName(author);

                    atlertMsg = `"_author_" has changed approval mode to "_new_"`;
                    atlertMsg = atlertMsg.replace('_author_', `${authorName}`).replace('_new_', getThreadInfo.approvalMode);
                    monitorID = getMonitorServerPerThread[threadID];
                }
            }
            break;
        case "log:thread-admins":
            {
                const oldAdmins = getThreadInfo.adminIDs || [];
                const targetID = logMessageData.TARGET_ID;

                const typeofEvent = logMessageData.ADMIN_EVENT;

                let newAdmins = null;
                if (typeofEvent == 'remove_admin') {
                    newAdmins = oldAdmins.filter(e => e.id != targetID);
                } else {
                    newAdmins = [...oldAdmins, { id: targetID }];
                }


                getThreadInfo.adminIDs = newAdmins;
                const allThreads = await Threads.getAll();
                const threadIndex = allThreads.findIndex(e => e.id == threadID);
                allThreads[threadIndex].info = getThreadInfo;
                await db.set('threads', allThreads);

                if (getMonitorServerPerThread[threadID]) {
                    const authorName = await Users.getName(author);
                    const targetName = await Users.getName(targetID);

                    atlertMsg = `"_author_" has ${typeofEvent == 'remove_admin' ? 'removed' : 'added'} "_target_" to the admin list.`;
                    atlertMsg = atlertMsg.replace('_author_', `${authorName}`).replace('_target_', targetName);
                    monitorID = getMonitorServerPerThread[threadID];
                }
            }
        default:
            break;
    }

    if (monitorID) {
        api.sendMessage(atlertMsg, monitorID);
    }


    return;
}
