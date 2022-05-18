export default async function ({ api, event, db, controllers }) {
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = controllers;
    const getThread = await Threads.checkThread(threadID) || {};
    const getThreadData = getThread.data;
    const getThreadInfo = getThread.info || {};
    const getMonitorServerPerThread = client.data.monitorServerPerThread;


    if (Object.keys(getThreadInfo).length > 0) {
        for (const user of logMessageData.addedParticipants) {
            if (!getThreadInfo.participantIDs.some(uid => uid == user.userFbId)) {
                getThreadInfo.participantIDs.push(user.userFbId);
            }
        };
    }
    const authorName = await Users.getName(author);
    if (logMessageData.addedParticipants.some(i => i.userFbId == botID)) {
        if (getThreadInfo.isSubscribed == false) getThreadInfo.isSubscribed = true;
        for (const server of client.data.monitorServers) {
            api.sendMessage(`Bot has been added to ${getThreadInfo.name || threadID} (${threadID}) by ${authorName} (${author})`, server);
        }
        const Prefix = getThreadData.prefix || client.config.PREFIX;
        api.changeNickname(`[ ${Prefix} ] ${(!client.config.BOTNAME) ? "Xavia" : client.config.BOTNAME}`, threadID, botID);
        api.sendMessage(`Connected successfully!\nUse ${Prefix}help to list all commands.`, threadID, () => {
            if (!getMonitorServerPerThread[threadID]) {
                const newMonitorName = `${threadID} - Monitor`;
                api.createNewGroup([botID, author], newMonitorName, async (err, info) => {
                    if (err) api.sendMessage(`Couldn't create new monitor for this group.`, threadID, () => console.log(err));
                    else {
                        const getModeratorData = await db.get('moderator');
                        getModeratorData.monitorServerPerThread[threadID] = info;
                        await db.set('moderator', getModeratorData);

                        client.data.monitorServerPerThread[threadID] = info;
                        api.sendMessage(`Group ${threadID} will be monitored here.`, info);
                    };
                });
            }
        });
    } else if (getMonitorServerPerThread[threadID]) {
        const joinNameArray = [];
        for (const id in logMessageData.addedParticipants) {
            const joinName = logMessageData.addedParticipants[id].fullName;
            joinNameArray.push(joinName);
        }
        let getMsg = `${authorName} added to group ${joinNameArray.length} member(s):\n${joinNameArray.join(', ')}`;
        api.sendMessage(getMsg, getMonitorServerPerThread[threadID], (err) => {
            if (err) console.log(err);
        });
    }
    const allThreads = await Threads.getAll();
    const threadIndex = allThreads.findIndex(e => e.id == threadID);
    getThread.info = getThreadInfo;
    allThreads[threadIndex] = getThread;
    await db.set('threads', allThreads);

    return;
}
