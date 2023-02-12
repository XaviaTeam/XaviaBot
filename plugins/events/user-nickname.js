export default async function ({ event }) {
    const { api } = global;
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = global.controllers;
    const getThread = await Threads.get(threadID) || {};
    const getThreadData = getThread.data || {};
    const getThreadInfo = getThread.info || {};


    if (Object.keys(getThreadInfo).length === 0) return;
    const oldNickname = getThreadInfo.nicknames[logMessageData.participant_id] || null;
    const newNickname = logMessageData.nickname;
    let smallCheck = false, atlertMsg, reversed = false;
    if (getThreadData.antiSettings.antiChangeNickname == true) {
        const isBot = author == botID;
        const isReversing = global.data.temps.some(i => i.type == 'antiChangeNickname' && i.threadID == threadID);
        if (!(isBot && isReversing)) {
            global.data.temps.push({ type: 'antiChangeNickname', threadID: threadID });

            await new Promise((resolve, reject) => {
                api.changeNickname(oldNickname, threadID, logMessageData.participant_id, async (err) => {
                    if (!err) reversed = true;

                    await new Promise(resolve => setTimeout(resolve, 300));
                    global.data.temps.splice(global.data.temps.indexOf({ type: 'antiChangeNickname', threadID: threadID }), 1);
                    resolve();
                });
            })
        } else if (isBot) {
            smallCheck = true;
        }
    } else {
        getThreadInfo.nicknames[logMessageData.participant_id] = newNickname;

        await Threads.updateInfo(threadID, { nicknames: getThreadInfo.nicknames });
    }

    if (!smallCheck && reversed && getThreadData?.antiSettings?.notifyChange === true)
        api.sendMessage(getLang('plugin.events.user-nickname.reversed_t'), threadID);

    if (!smallCheck && getThreadData?.notifyChange?.status === true) {
        const authorName = (await Users.getInfo(author))?.name || author;
        const targetName = (await Users.getInfo(logMessageData.participant_id))?.name || logMessageData.participant_id;

        if (author == logMessageData.participant_id) {
            atlertMsg = getLang('plugin.events.user-nickname.changedBySelf', {
                authorName: authorName,
                authorId: author,
                newNickname: newNickname
            })
        } else {
            atlertMsg = getLang('plugin.events.user-nickname.changedBy', {
                authorName: authorName,
                authorId: author,
                targetName: targetName,
                targetId: logMessageData.participant_id,
                newNickname: newNickname
            })
        }

        if (reversed) {
            atlertMsg += getLang('plugin.events.user-nickname.reversed');
        }

        for (const rUID of getThreadData.notifyChange.registered) {
            global.sleep(300);
            api.sendMessage(atlertMsg, rUID);
        }
    }

    return;
}
