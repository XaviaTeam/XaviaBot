// import moment from 'moment-timezone';

// const logger = text => global.modules.get("logger").custom(text, moment().tz(global.config.timezone).format('YYYY-MM-DD_HH:mm:ss'));

export default async function ({ event }) {
    const { api } = global;
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = global.controllers;
    const getThread = await Threads.get(threadID) || {};

    const getThreadInfo = getThread.info || {};


    if (Object.keys(getThreadInfo).length === 0) return;
    // getThreadInfo.members.splice(getThreadInfo.members.findIndex(mem => mem.userID == String(logMessageData.leftParticipantFbId)), 1);
    const leftMemberIndex = getThreadInfo.members.findIndex(mem => mem.userID == logMessageData.leftParticipantFbId);
    if (leftMemberIndex > -1) {
        delete getThreadInfo.members[leftMemberIndex].exp;
    }

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

        return;
    } else if (getThread.data?.notifyChange?.status === true) {
        // const leftName = (await Users.getInfo(logMessageData.leftParticipantFbId))?.name || logMessageData.leftParticipantFbId;

        // let atlertMsg = getLang(`plugins.events.unsubcribe.${type}`, {
        //     authorName: authorName,
        //     authorId: author,
        //     leftName: leftName,
        //     leftId: logMessageData.leftParticipantFbId
        // });

        // for (const rUID of getThread.data.notifyChange.registered) {
        //     global.sleep(300);
        //     api.sendMessage(atlertMsg, rUID);
        // }
    };

    let callback = async () => {
        const leftName = (await Users.getInfo(logMessageData.leftParticipantFbId))?.name || logMessageData.leftParticipantFbId;

        let atlertMsg = {
            body: (getThread?.data?.leaveMessage ?
                getThread.data.leaveMessage : getLang(`plugins.events.unsubcribe.${type}`))
                .replace(/\{leftName}/g, leftName),
            mentions: [{
                tag: leftName,
                id: logMessageData.leftParticipantFbId
            }]
        }

        const gifPath = `${global.mainPath}/plugins/events/unsubcribeGifs/${threadID}.gif`;
        if (global.isExists(gifPath)) {
            atlertMsg.attachment = [await global.getStream(gifPath)];
        }

        api.sendMessage(atlertMsg, threadID);
    }

    if (getThread?.data?.antiSettings?.antiOut && type == "left") {
        global.api.addUserToGroup(logMessageData.leftParticipantFbId, threadID, async (err) => {
            let needNotify = getThread?.data?.antiSettings?.notifyChange === true;
            if (err) {
                await callback();

                console.error(err);
                if (needNotify) global.api.sendMessage(getLang("plugins.events.unsubcribe.antiOut.error"), threadID);
            } else {
                if (needNotify) global.api.sendMessage(getLang("plugins.events.unsubcribe.antiOut.success"), threadID);
            }
        })
    } else await callback();

    await Threads.updateInfo(threadID, { members: getThreadInfo.members, isSubscribed: getThreadInfo.isSubscribed });

    return;
}
