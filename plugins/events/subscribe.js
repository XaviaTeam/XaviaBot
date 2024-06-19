/**
 *
 * @param {{ event: Extract<Parameters<TOnCallEvents>[0]["event"], { logMessageType: "log:subscribe" }> }} param0
 * @returns
 */
export default async function subscribe({ event }) {
    const { api } = global;
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = global.controllers;
    const getThread = await Threads.get(threadID);

    if (getThread == null) return;

    const getThreadData = getThread.data;
    const getThreadInfo = getThread.info;

    if (Object.keys(getThreadInfo).length > 0) {
        for (const user of logMessageData.addedParticipants) {
            if (
                !getThreadInfo.members.some(
                    (mem) => mem.userID == user.userFbId
                )
            ) {
                getThreadInfo.members.push({ userID: user.userFbId });
            }
        }
    }
    const authorName = (await Users.getInfo(author))?.name || author;

    if (logMessageData.addedParticipants.some((i) => i.userFbId == botID)) {
        if (getThreadInfo.isSubscribed == false)
            getThreadInfo.isSubscribed = true;
        for (const adid of global.config.MODERATORS) {
            await global.utils.sleep(300);
            api.sendMessage(
                getLang("plugins.events.subscribe.addSelf"),
                {
                    threadName: getThreadInfo.name || threadID,
                    threadId: threadID,
                    authorName: authorName,
                    authorId: author,
                },
                adid
            );
        }
        const PREFIX = getThreadData.prefix || global.config.PREFIX;
        api.changeNickname(
            `[ ${PREFIX} ] ${global.config.NAME || "Xavia"}`,
            threadID,
            botID
        );
        api.sendMessage(
            getLang("plugins.events.subscribe.connected", { PREFIX }),
            threadID
        );

        return;
    } else if (getThreadData?.notifyChange?.status === true) {
        // const joinNameArray = [], mentions = [];
        // for (const id in logMessageData.addedParticipants) {
        //     const joinName = logMessageData.addedParticipants[id].fullName;
        //     joinNameArray.push(joinName);
        //     mentions.push({
        //         id: logMessageData.addedParticipants[id].userFbId,
        //         tag: joinName
        //     })
        // }
        // let alertMsg = {
        //     body: getLang("plugins.events.subscribe.addMembers", {
        //         authorName: authorName,
        //         authorId: author,
        //         membersLength: joinNameArray.length,
        //         members: joinNameArray.join(', ')
        //     }),
        //     mentions
        // }
        // for (const rUID of getThreadData.notifyChange.registered) {
        //     global.sleep(300);
        //     api.sendMessage(alertMsg, rUID, (err) => console.error(err));
        // }
    }

    const joinNameArray = [],
        mentions = [],
        warns = [];
    for (const participant of logMessageData.addedParticipants) {
        let uid = participant.userFbId;
        if (
            getThreadInfo.members.some(
                (mem) => mem.userID == uid && mem?.warns?.length >= 3
            )
        ) {
            warns.push(uid);
            continue;
        }

        const joinName = participant.fullName;
        joinNameArray.push(joinName);
        mentions.push({
            id: uid,
            tag: joinName,
        });
    }

    if (warns.length > 0) {
        for (const uid of warns) {
            await new Promise((resolve) => {
                api.removeUserFromGroup(uid, threadID, (err) => {
                    if (err) {
                        console.error(err);
                        return resolve();
                    }

                    let username = logMessageData.addedParticipants.find(
                        (i) => i.userFbId == uid
                    ).fullName;

                    api.sendMessage(
                        {
                            body: getLang("plugins.events.subscribe.warns", {
                                username,
                            }),
                            mentions: [
                                {
                                    id: uid,
                                    tag: username,
                                },
                            ],
                        },
                        threadID,
                        (err) => {
                            if (err) console.error(err);
                            return resolve();
                        }
                    );
                });
            });
        }
    }

    let oldMembersLength = getThreadInfo.members.length - joinNameArray.length;
    let newCount = joinNameArray.map((_, i) => i + oldMembersLength + 1);

    let alertMsg = {
        body: (getThreadData?.joinMessage
            ? getThreadData.joinMessage
            : getLang("plugins.events.subscribe.welcome")
        )
            .replace(/\{members}/g, joinNameArray.join(", "))
            .replace(/\{newCount}/g, newCount.join(", "))
            .replace(/\{threadName}/g, getThreadInfo.name || threadID),
        mentions,
    };

    const gifPath = `${global.mainPath}/plugins/events/subscribeGifs/${threadID}.gif`;

    if (logMessageData.addedParticipants.length == 1 && warns.length == 0) {
        const profilePicUrl = global.utils.getAvatarURL(
            logMessageData.addedParticipants[0].userFbId
        );

        const username = logMessageData.addedParticipants[0].fullName;
        const welcomeCard = await global.utils
            .getStream(
                `${
                    global.xva_api.popcat
                }/welcomecard?background=https://cdn.popcat.xyz/welcome-bg.png&text1=${encodeURIComponent(
                    username
                )}&text2=Welcome+To+${encodeURIComponent(
                    getThreadInfo.name || threadID
                )}&text3=Member+${newCount[0]}&avatar=${encodeURIComponent(
                    profilePicUrl
                )}`
            )
            .catch(() => null);

        if (welcomeCard) alertMsg.attachment = [welcomeCard];
    }

    if (!alertMsg.attachment && global.isExists(gifPath)) {
        alertMsg.attachment = [await global.getStream(gifPath)];
    }

    if (joinNameArray.length > 0)
        api.sendMessage(alertMsg, threadID, (err) =>
            err ? console.error(err) : null
        );

    await Threads.updateInfo(threadID, {
        members: getThreadInfo.members,
        isSubscribed: getThreadInfo.isSubscribed,
    });

    return;
}
