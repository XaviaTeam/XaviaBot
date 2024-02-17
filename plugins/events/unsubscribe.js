export default async function unsubscribe({ event }) {
    const { api } = global;
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = global.controllers;
    const getThread = await Threads.get(threadID);

    if (!getThread) return;

    const getThreadInfo = getThread.info;
    const leftId = logMessageData.leftParticipantFbId;


    if (Object.keys(getThreadInfo).length === 0) return;
    
    const leftMemberIndex = getThreadInfo.members.findIndex(mem => mem.userID == leftId);
    if (leftMemberIndex > -1) {
        getThreadInfo.members.splice(leftMemberIndex, 1);
    }
    
    const adminIndex = getThreadInfo.adminIDs.findIndex(id => id == leftId);
    if (adminIndex > -1) {
        getThreadInfo.adminIDs.splice(adminIndex, 1);
    }

    if (getThreadInfo.nicknames && leftId in getThreadInfo.nicknames) {
        delete getThreadInfo.nicknames[leftId];
    }

    const type = (author == leftId) ? "left" : "kicked";
    const authorName = (await Users.getInfo(author))?.name || author;

    if (leftId == botID) {
        // logger(`${threadID} • ${author} removed bot from thread`);
        getThreadInfo.isSubscribed = false;

        let alertMsg = getLang(`plugins.events.unsubscribe.bot.${type}`, {
            authorName: authorName,
            authorId: author,
            threadName: getThreadInfo.name,
            threadId: threadID
        });
        for (const adid of global.config.MODERATORS) {
            await global.utils.sleep(300);
            if (adid != threadID) {
                api.sendMessage(alertMsg, adid);
            }
        }

        return;
    } else if (getThread.data?.notifyChange?.status === true) {
        // const leftName = (await Users.getInfo(logMessageData.leftParticipantFbId))?.name || logMessageData.leftParticipantFbId;

        // let alertMsg = getLang(`plugins.events.unsubscribe.${type}`, {
        //     authorName: authorName,
        //     authorId: author,
        //     leftName: leftName,
        //     leftId: logMessageData.leftParticipantFbId
        // });

        // for (const rUID of getThread.data.notifyChange.registered) {
        //     global.sleep(300);
        //     api.sendMessage(alertMsg, rUID);
        // }
    };

    let callback = async () => {
        const leftName = (await Users.getInfo(leftId))?.name || leftId;

        let alertMsg = {
            body: (getThread?.data?.leaveMessage ?
                getThread.data.leaveMessage : getLang(`plugins.events.unsubscribe.${type}`))
                .replace(/\{leftName}/g, leftName),
            mentions: [{
                tag: leftName,
                id: leftId
            }]
        }

        const gifPath = `${global.mainPath}/plugins/events/unsubscribeGifs/${threadID}.gif`;
        if (global.isExists(gifPath)) {
            alertMsg.attachment = [await global.getStream(gifPath)];
        }

        api.sendMessage(alertMsg, threadID);
    }

    if (getThread?.data?.antiSettings?.antiOut && type == "left") {
        global.api.addUserToGroup(leftId, threadID, async (err) => {
            let needNotify = getThread?.data?.antiSettings?.notifyChange === true;
            if (err) {
                await callback();

                console.error(err);
                if (needNotify) global.api.sendMessage(getLang("plugins.events.unsubscribe.antiOut.error"), threadID);
            } else {
                if (needNotify) global.api.sendMessage(getLang("plugins.events.unsubscribe.antiOut.success"), threadID);
            }
        })
    } else await callback();

    // await Threads.updateInfo(threadID, { members: getThreadInfo.members, isSubscribed: getThreadInfo.isSubscribed });

    return;
}
