export default async function ({ api, event, db, controllers }) {
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = controllers;
    const getThread = await Threads.checkThread(threadID) || {};

    const getThreadInfo = getThread.info || {};
    const getMonitorServerPerThread = client.data.monitorServerPerThread;


    if (Object.keys(getThreadInfo).length === 0) return;
    getThreadInfo.participantIDs.splice(getThreadInfo.participantIDs.indexOf(String(logMessageData.leftParticipantFbId)), 1);
    const type = (author == logMessageData.leftParticipantFbId) ? "left" : "kicked";
    const authorName = await Users.getName(author);

    if (logMessageData.leftParticipantFbId == botID) {
        getThreadInfo.isSubscribed = false;

        for (const server of client.data.monitorServers) {
            if (server != threadID) {
                api.sendMessage(getLang(`plugins.events.unsubcribe.bot.${type}`, {
                    authorName: authorName,
                    authorId: author,
                    threadName: getThreadInfo.name,
                    threadId: threadID
                }), server);
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
        api.sendMessage(getLang(`plugins.events.unsubcribe.${type}`, {
            authorName: authorName,
            authorId: author,
            leftName: leftName,
            leftId: logMessageData.leftParticipantFbId
        }), getMonitorServerPerThread[threadID], (err) => {
            if (err) console.error(err);
        });
    };

    const allThreads = await Threads.getAll();
    const threadIndex = allThreads.findIndex(e => e.id == threadID);
    getThread.info = getThreadInfo;
    allThreads[threadIndex] = getThread;
    await db.set('threads', allThreads);

    return;
}
