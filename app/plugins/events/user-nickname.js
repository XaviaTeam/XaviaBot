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
    let atlertMsg = '"_author_" has changed "_target_" nickname to "_new_"',
        smallCheck = false;
    if (getThreadData.noChangeNickname == true) {
        const isBot = author == botID;
        const isReversing = client.data.temps.some(i => i.type == 'noChangeNickname' && i.threadID == threadID);
        if (!(isBot && isReversing)) {
            client.data.temps.push({ type: 'noChangeNickname', threadID: threadID });
            atlertMsg += '\nGroup does not allow nickname change so it has been ignored.';
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
        atlertMsg = atlertMsg.replace('_author_', `${authorName}`).replace('_target_', targetName).replace('_new_', newNickname);
        api.sendMessage(atlertMsg, getMonitorServerPerThread[threadID]);
    }

    return;
}
