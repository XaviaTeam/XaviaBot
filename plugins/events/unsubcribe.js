// import moment from 'moment-timezone';

// const logger = text => global.modules.get("logger").custom(text, moment().tz(global.config.timezone).format('YYYY-MM-DD_HH:mm:ss'));

export default async function ({ event }) {
    const { api } = global;
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = global.controllers;
    const getThread = await Threads.get(threadID) || {};

    const getThreadInfo = getThread.info || {};


    if (Object.keys(getThreadInfo).length === 0) return;
    getThreadInfo.members.splice(getThreadInfo.members.findIndex(mem => mem.userID == String(logMessageData.leftParticipantFbId)), 1);
    const type = (author == logMessageData.leftParticipantFbId) ? "left" : "kicked";
    const authorName = (await Users.getInfo(author))?.name || author;

    if (logMessageData.leftParticipantFbId == botID) {
        // logger(`${threadID} • ${author} removed bot from thread`);
        getThreadInfo.isSubscribed = false;

        let atlertMsg = getLang(`plugins.events.unsubcribe.bot.${type}`, {
            authorName: authorName,
            authorId: author,
            threadName: getThreadInfo.name,
            threadId: threadID
        });
        for (const adid of global.config.MODERATORS) {
            global.sleep(300);
            if (adid != threadID) {
                api.sendMessage(atlertMsg, adid);
            }
        }
    } else if (getThread.data?.notifyChange?.status === true) {
        const leftName = (await Users.getInfo(logMessageData.leftParticipantFbId))?.name || logMessageData.leftParticipantFbId;

        let atlertMsg = getLang(`plugins.events.unsubcribe.${type}`, {
            authorName: authorName,
            authorId: author,
            leftName: leftName,
            leftId: logMessageData.leftParticipantFbId
        });

        for (const rUID of getThread.data.notifyChange.registered) {
            global.sleep(300);
            api.sendMessage(atlertMsg, rUID);
        }
    };

    await Threads.updateInfo(threadID, { members: getThreadInfo.members, isSubscribed: getThreadInfo.isSubscribed });

    return;
}
