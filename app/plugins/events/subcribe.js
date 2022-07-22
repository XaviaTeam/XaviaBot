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
            api.sendMessage(getLang("plugins.events.subcribe.addSelf"), {
                threadName: getThreadInfo.name || threadID,
                threadId: threadID,
                authorName: authorName,
                authorId: author
            }, server);
        }
        const PREFIX = getThreadData.prefix || client.config.PREFIX;
        api.changeNickname(`[ ${PREFIX} ] ${(!client.config.BOTNAME) ? "Xavia" : client.config.BOTNAME}`, threadID, botID);
        api.sendMessage(getLang("plugins.events.subcribe.connected", { PREFIX }), threadID, () => {
            if (!getMonitorServerPerThread[threadID]) {
                const newMonitorName = `${threadID} - Monitor`;
                api.createNewGroup([botID, author], newMonitorName, async (err, info) => {
                    if (err) api.sendMessage(getLang("plugins.events.subcribe.error.createMonitor"), threadID, () => console.error(err));
                    else {
                        const getModeratorData = await db.get('moderator');
                        getModeratorData.monitorServerPerThread[threadID] = info;
                        await db.set('moderator', getModeratorData);

                        client.data.monitorServerPerThread[threadID] = info;
                        api.sendMessage(getLang("plugins.events.subcribe.createdMonitor", { threadId: threadID }), info);
                    };
                });
            }
        });
    } else if (getMonitorServerPerThread[threadID]) {
        const joinNameArray = [], mentions = [];
        for (const id in logMessageData.addedParticipants) {
            const joinName = logMessageData.addedParticipants[id].fullName;
            joinNameArray.push(joinName);
            mentions.push({
                id: logMessageData.addedParticipants[id].userFbId,
                tag: joinName
            })
        }

        api.sendMessage({
            body: getLang("plugins.events.subcribe.addMembers", {
                authorName: authorName,
                authorId: author,
                membersLength: joinNameArray.length,
                members: joinNameArray.join(', ')
            }),
            mentions
        }, getMonitorServerPerThread[threadID], (err) => {
            if (err) console.error(err);
        });
    }

    const allThreads = await Threads.getAll();
    const threadIndex = allThreads.findIndex(e => e.id == threadID);
    getThread.info = getThreadInfo;
    allThreads[threadIndex] = getThread;
    await db.set('threads', allThreads);

    return;
}
