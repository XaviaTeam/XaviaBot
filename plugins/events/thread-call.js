/**
 *
 * @param {{ event: Extract<Parameters<TOnCallEvents>[0]["event"], { logMessageType: "log:thread-call" }> }} param0
 * @returns
 */
export default async function ({ event }) {
    const { api, getLang } = global;
    const { threadID, logMessageData } = event;
    const { Threads, Users } = global.controllers;

    const getThread = await Threads.get(threadID);

    if (getThread == null) return;

    const getThreadData = getThread.data;

    if (getThreadData.notifyChange?.status !== true) return;

    const typeofCall = logMessageData.video ? "Video" : "";
		const callerID = logMessageData.caller_id;
		const joinerID = logMessageData.joining_user;

    let alertMsg = "";

    if (logMessageData.event == "group_call_started") {
        const authorName =
            (await Users.getInfo(callerID))?.name ??
            callerID;

        alertMsg = getLang(
            `plugins.events.thread-call.started${typeofCall}Call`,
            {
                authorName: authorName,
                authorId: callerID,
            }
        );
    } else if (logMessageData.event == "group_call_ended") {
        const callDuration = global.utils.msToHMS(
            logMessageData.call_duration * 1000
        );

        alertMsg = getLang(
            `plugins.events.thread-call.ended${typeofCall}Call`,
            {
                callDuration: callDuration,
            }
        );
    } else if (joinerID) {
        const authorName =
            (await Users.getInfo(joinerID))?.name ??
            joinerID;

        alertMsg = getLang(
            `plugins.events.thread-call.joined${typeofCall}Call`,
            {
                authorName: authorName,
                authorId: joinerID,
            }
        );
    }

    for (const rUID of getThreadData.notifyChange.registered) {
        await global.utils.sleep(300);
        api.sendMessage(alertMsg, rUID, (err) => console.error(err));
    }

    return;
}
