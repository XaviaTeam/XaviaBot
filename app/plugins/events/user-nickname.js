export default async function ({ api, event, db, controllers }) {
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = controllers;
    const getThread = await Threads.checkThread(threadID) || {};
    const getThreadData = getThread.data;
    const getThreadInfo = getThread.info || {};
    const getMonitorServerPerThread = client.data.monitorServerPerThread;


    if (Object.keys(getThreadInfo).length === 0) return;
    const oldNickname = getThreadInfo.nicknames[logMessageData.participant_id] || null;
    const newNickname = logMessageData.nickname;
    let smallCheck = false, atlertMsg, reversing = false;
    if (getThreadData.noChangeNickname == true) {
        const isBot = author == botID;
        const isReversing = client.data.temps.some(i => i.type == 'noChangeNickname' && i.threadID == threadID);
        if (!(isBot && isReversing)) {
            client.data.temps.push({ type: 'noChangeNickname', threadID: threadID });
            reversing = true;
            api.changeNickname(oldNickname, threadID, logMessageData.participant_id, async () => {
                await new Promise(resolve => setTimeout(resolve, 300));
                client.data.temps.splice(client.data.temps.indexOf({ type: 'noChangeNickname', threadID: threadID }), 1);
            });
        } else if (isBot) {
            smallCheck = true;
        }
    } else {
        getThreadInfo.nicknames[logMessageData.participant_id] = newNickname;
        const allThreads = await Threads.getAll();
        const threadIndex = allThreads.findIndex(e => e.id == threadID);
        allThreads[threadIndex].info = getThreadInfo;
        await db.set('threads', allThreads);
    }

    if (!smallCheck && getMonitorServerPerThread[threadID]) {
        const authorName = await Users.getName(author);
        const targetName = await Users.getName(logMessageData.participant_id);

        if (author == logMessageData.participant_id) {
            atlertMsg = getLang('plugin.events.user-nickname.changedBySelf', {
                authorName: authorName,
                authorId: author,
                newNickname: newNickname
            })
        } else {
            atlertMsg = getLang('plugin.events.user-nickname.changedBy', {
                authorName: authorName,
                authorId: author,
                targetName: targetName,
                targetId: logMessageData.participant_id,
                newNickname: newNickname
            })
        }

        if (reversing) {
            atlertMsg += getLang('plugin.events.user-nickname.reversed');
        }

        api.sendMessage(atlertMsg, getMonitorServerPerThread[threadID]);
    }

    return;
}
