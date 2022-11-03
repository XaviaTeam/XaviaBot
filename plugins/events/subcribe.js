// import moment from 'moment-timezone';

// const logger = text => global.modules.get("logger").custom(text, moment().tz(global.config.timezone).format('YYYY-MM-DD_HH:mm:ss'));

export default async function ({ event }) {
    const { api } = global;
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = global.controllers;
    const getThread = await Threads.get(threadID) || {};
    const getThreadData = getThread.data || {};
    const getThreadInfo = getThread.info || {};

    if (Object.keys(getThreadInfo).length > 0) {
        for (const user of logMessageData.addedParticipants) {
            if (!getThreadInfo.members.some(mem => mem.userID == user.userFbId)) {
                getThreadInfo.members.push({ userID: user.userFbId });
            }
        };
    }
    const authorName = (await Users.getInfo(author))?.name || author;
    console.log(botID);
    if (logMessageData.addedParticipants.some(i => i.userFbId == botID)) {
        // logger(`${threadID} • ${author} added bot to thread`, 'EVENT');
        if (getThreadInfo.isSubscribed == false) getThreadInfo.isSubscribed = true;
        for (const adid of global.config.MODERATORS) {
            global.sleep(300);
            api.sendMessage(getLang("plugins.events.subcribe.addSelf"), {
                threadName: getThreadInfo.name || threadID,
                threadId: threadID,
                authorName: authorName,
                authorId: author
            }, adid);
        }
        const PREFIX = getThreadData.prefix || global.config.PREFIX;
        api.changeNickname(`[ ${PREFIX} ] ${global.config.NAME || "Xavia"}`, threadID, botID);
        api.sendMessage(getLang("plugins.events.subcribe.connected", { PREFIX }), threadID);
    } else if (getThreadData?.notifyChange?.status === true) {
        const joinNameArray = [], mentions = [];
        for (const id in logMessageData.addedParticipants) {
            const joinName = logMessageData.addedParticipants[id].fullName;
            joinNameArray.push(joinName);
            mentions.push({
                id: logMessageData.addedParticipants[id].userFbId,
                tag: joinName
            })
        }

        let atlertMsg = {
            body: getLang("plugins.events.subcribe.addMembers", {
                authorName: authorName,
                authorId: author,
                membersLength: joinNameArray.length,
                members: joinNameArray.join(', ')
            }),
            mentions
        }
        for (const rUID of getThreadData.notifyChange.registered) {
            global.sleep(300);
            api.sendMessage(atlertMsg, rUID, (err) => console.error(err));
        }
    }

    await Threads.updateInfo(threadID, {
        members: getThreadInfo.members,
        isSubscribed: getThreadInfo.isSubscribed
    });

    return;
}
