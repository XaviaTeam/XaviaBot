export default async function ({ api, event, db, controllers }) {
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = controllers;
    const getThread = await Threads.checkThread(threadID) || {};

    const getThreadInfo = getThread.info || {};
    const getMonitorServerPerThread = client.data.monitorServerPerThread;

    if (Object.keys(getThreadInfo).length === 0) return;
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
        const atlertMsg = `"_author_" has ${typeofEvent == 'remove_admin' ? 'removed' : 'added'} "_target_" to the admin list.`;
        api.sendMessage(atlertMsg.replace('_author_', `${authorName}`).replace('_target_', targetName), getMonitorServerPerThread[threadID]);
    }

    return;
}
