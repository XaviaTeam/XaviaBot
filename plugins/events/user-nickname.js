/**
 * 
 * @param {{ event: Extract<Parameters<TOnCallEvents>[0]["event"], { logMessageType: "log:user-nickname" }> }} param0 
 * @returns 
 */
export default async function ({ event }) {
    const { api } = global;
    const { threadID, author: authorID, logMessageData } = event;
    const { Threads, Users } = global.controllers;
    const getThread = await Threads.get(threadID);

		if (getThread == null) return;

    const getThreadData = getThread.data;
    const getThreadInfo = getThread.info;

		const targetID = logMessageData.participant_id;

		if (!getThreadInfo.hasOwnProperty('nicknames')) {
				getThreadInfo.nicknames = {};
		}

    const oldNickname = getThreadInfo.nicknames[targetID] || null;
    const newNickname = logMessageData.nickname;
    let alertMsg, reversed = false;
		
		const isBotAction = authorID == global.botID;
		const isNotAllowed = getThreadData.antiSettings?.antiChangeNickname == true;
    if (isNotAllowed && !isBotAction) {
				const isReversingIndex = global.data.temps.findIndex(i => i.type == 'antiChangeNickname' && i.threadID == threadID && i.targetID == targetID);
        const isReversing = isReversingIndex != -1;

				if (!isBotAction && isReversing); // might bug
        if (!isBotAction && !isReversing) {
            global.data.temps.push({ type: 'antiChangeNickname', threadID: threadID, targetID: targetID });

						const result = await api.changeNickname(oldNickname, threadID, targetID).catch(_ => null);
						if (result != null) {
								reversed = true;
						}

						global.data.temps.splice(isReversingIndex, 1);
        }
    } else {
        getThreadInfo.nicknames[targetID] = newNickname;

        await Threads.updateInfo(threadID, { nicknames: getThreadInfo.nicknames });
    }

    if (!isBotAction && reversed && getThreadData.antiSettings?.notifyChange === true)
        api.sendMessage(getLang('plugin.events.user-nickname.reversed_t'), threadID);

    if (!isBotAction && getThreadData.notifyChange?.registered?.length > 0) {
        const authorName = (await Users.getInfo(authorID))?.name ?? authorID;
        const targetName = (await Users.getInfo(targetID))?.name ?? targetID;

        if (authorID == targetID) {
            alertMsg = getLang('plugin.events.user-nickname.changedBySelf', {
                authorName: authorName,
                authorId: authorID,
                newNickname: newNickname
            })
        } else {
            alertMsg = getLang('plugin.events.user-nickname.changedBy', {
                authorName: authorName,
                authorId: authorID,
                targetName: targetName,
                targetId: targetID,
                newNickname: newNickname
            })
        }

        if (reversed) {
            alertMsg += getLang('plugin.events.user-nickname.reversed');
        }

        for (const rUID of getThreadData.notifyChange.registered) {
            await global.utils.sleep(300);
            api.sendMessage(alertMsg, rUID);
        }
    }

    return;
}
