export default async function ({ event }) {
    const { api } = global;
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = global.controllers;
    const getThread = (await Threads.get(threadID)) || {};
    const getThreadData = getThread.data || {};
    const getThreadInfo = getThread.info || {};

    let alertMsg = null,
        reversed = false;

    if (Object.keys(getThreadInfo).length === 0) return;
    switch (event.logMessageType) {
        case "log:thread-name":
            {
                const oldName = getThreadInfo.name || null;
                const newName = logMessageData.name;
                let smallCheck = false;

                if (getThreadData.antiSettings?.antiChangeGroupName == true) {
                    const isBot = author == botID;
                    const isReversing = global.data.temps.some(
                        (i) =>
                            i.type == "antiChangeGroupName" &&
                            i.threadID == threadID
                    );
                    if (!(isBot && isReversing)) {
                        global.data.temps.push({
                            type: "antiChangeGroupName",
                            threadID: threadID,
                        });
                        await new Promise((resolve) => {
                            api.setTitle(oldName, threadID, (err) => {
                                if (!err) reversed = true;
                                global.data.temps.splice(
                                    global.data.temps.indexOf({
                                        type: "antiChangeGroupName",
                                        threadID: threadID,
                                    }),
                                    1
                                );

                                resolve();
                            });
                        });
                    } else if (isBot) {
                        smallCheck = true;
                    }
                } else {
                    await Threads.updateInfo(threadID, { name: newName });
                }

                if (
                    !smallCheck &&
                    reversed &&
                    getThreadData?.antiSettings?.notifyChange === true
                )
                    api.sendMessage(
                        getLang("plugins.events.thread-update.name.reversed_t"),
                        threadID
                    );

                if (
                    !smallCheck &&
                    getThreadData?.notifyChange?.status === true
                ) {
                    const authorName =
                        (await Users.getInfo(author))?.name || author;
                    alertMsg = getLang(
                        "plugins.events.thread-update.name.changed",
                        {
                            authorName: authorName,
                            authorId: author,
                            newName: newName,
                        }
                    );
                    if (reversed) {
                        alertMsg += getLang(
                            "plugins.events.thread-update.name.reversed"
                        );
                    }
                }
            }
            break;
        case "log:thread-color":
        case "log:thread-icon":
            {
                const oldColor = getThreadInfo.color;
                if (
                    logMessageData.hasOwnProperty("thread_color") ||
                    logMessageData.hasOwnProperty("theme_color")
                ) {
                    const newColor = (
                        logMessageData.thread_color ||
                        logMessageData.theme_color
                    ).slice(2);

                    await Threads.updateInfo(threadID, { color: newColor });
                    if (getThreadData?.notifyChange?.status === true) {
                        const authorName =
                            (await Users.getInfo(author))?.name || author;

                        alertMsg = getLang(
                            "plugins.events.thread-update.color.changed",
                            {
                                authorName: authorName,
                                authorId: author,
                                oldColor: oldColor,
                                newColor: newColor,
                            }
                        );
                        if (
                            logMessageData.hasOwnProperty(
                                "theme_name_with_subtitle"
                            )
                        ) {
                            alertMsg += `\n • Theme: ${logMessageData.theme_name_with_subtitle}`;
                        }
                    }
                }
                const oldEmoji = getThreadInfo.emoji;
                if (
                    logMessageData.hasOwnProperty("thread_icon") ||
                    logMessageData.hasOwnProperty("theme_emoji")
                ) {
                    const newEmoji =
                        logMessageData.thread_icon ||
                        logMessageData.theme_emoji;

                    await Threads.updateInfo(threadID, { emoji: newEmoji });
                    if (getThreadData?.notifyChange?.status === true) {
                        const authorName =
                            (await Users.getInfo(author))?.name || author;

                        alertMsg = getLang(
                            "plugins.events.thread-update.emoji.changed",
                            {
                                authorName: authorName,
                                authorId: author,
                                oldEmoji: oldEmoji,
                                newEmoji: newEmoji,
                            }
                        );
                    }
                }
            }
            break;
        case "log:thread-approval-mode":
            {
                getThreadInfo.approvalMode =
                    logMessageData.APPROVAL_MODE == 0 ? false : true;

                await Threads.updateInfo(threadID, {
                    approvalMode: getThreadInfo.approvalMode,
                });
                if (getThreadData?.notifyChange?.status === true) {
                    const authorName =
                        (await Users.getInfo(author))?.name || author;

                    alertMsg = getLang(
                        "plugins.events.thread-update.approvalMode.changed",
                        {
                            authorName: authorName,
                            authorId: author,
                            newApprovalMode: getThreadInfo.approvalMode,
                        }
                    );
                }
            }
            break;
        case "log:thread-admins": {
            const adminIDs = getThreadInfo.adminIDs || [];
            const targetID = logMessageData.TARGET_ID;

            const typeofEvent = logMessageData.ADMIN_EVENT;

            if (typeofEvent == "remove_admin") {
                const indexOfTarget = adminIDs.indexOf(targetID);
                if (indexOfTarget > -1) {
                    adminIDs.splice(indexOfTarget, 1);
                }
            } else {
                adminIDs.push(targetID);
            }

            await Threads.updateInfo(threadID, { adminIDs: adminIDs });

            if (getThreadData?.notifyChange?.status === true) {
                const authorName =
                    (await Users.getInfo(author))?.name || author;
                const targetName =
                    (await Users.getInfo(targetID))?.name || targetID;

                alertMsg = getLang(
                    `plugins.events.thread-update.admins.${
                        typeofEvent == "remove_admin" ? "removed" : "added"
                    }`,
                    {
                        authorName: authorName,
                        authorId: author,
                        targetName: targetName,
                        targetId: targetID,
                    }
                );
            }
        }
        default:
            break;
    }

    if (alertMsg) {
        for (const rUID of getThreadData.notifyChange.registered) {
            await global.utils.sleep(300);
            api.sendMessage(alertMsg, rUID);
        }
    }

    return;
}
