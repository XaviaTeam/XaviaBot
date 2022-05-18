export default async function ({ api, event, db, controllers }) {
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = controllers;
    const getThread = await Threads.checkThread(threadID) || {};

    const getThreadInfo = getThread.info || {};
    const getMonitorServerPerThread = client.data.monitorServerPerThread;


    if (Object.keys(getThreadInfo).length === 0) return;
    getThreadInfo.participantIDs.splice(getThreadInfo.participantIDs.indexOf(String(logMessageData.leftParticipantFbId)), 1);
    const type = (author == logMessageData.leftParticipantFbId) ? "has left" : "has been kicked out from";
    const authorName = await Users.getName(author);

    if (logMessageData.leftParticipantFbId == botID) {
        getThreadInfo.isSubscribed = false;

        for (const server of client.data.monitorServers) {
            if (server != threadID) {
                api.sendMessage(`Bot ${type} ${getThreadInfo.name} (${threadID}) ${type == "has been kicked out from" ? ` by ${authorName} (${author})` : ''}`, server);
            } else {
                client.data.monitorServers.splice(client.data.monitorServers.indexOf(server), 1);
                const getSettings = await db.get('Moderator');
                let monitorServers = getSettings.monitorServers || [];
                if (monitorServers.includes(server)) {
                    monitorServers.splice(monitorServers.indexOf(server), 1);
                }
                getSettings.monitorServers = monitorServers;
                await db.set('Moderator', getSettings);
            }
        }
    } else if (getMonitorServerPerThread[threadID]) {
        const leftName = await Users.getName(logMessageData.leftParticipantFbId);
        const getMsg = `${leftName} ${type} ${getThreadInfo.name}${type == "has been kicked out from" ? ` by ${authorName}` : ''}`;
        api.sendMessage(getMsg, getMonitorServerPerThread[threadID], (err) => {
            if (err) console.log(err);
        });
    };

    const allThreads = await Threads.getAll();
    const threadIndex = allThreads.findIndex(e => e.id == threadID);
    getThread.info = getThreadInfo;
    allThreads[threadIndex] = getThread;
    await db.set('threads', allThreads);

    return;
}
