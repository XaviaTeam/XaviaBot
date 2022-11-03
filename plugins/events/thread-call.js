export default async function ({ event }) {
    const { api } = global;
    const { threadID, logMessageData } = event;
    const { Users, Threads } = global.controllers;

    const getThread = await Threads.get(threadID);
    const getThreadData = getThread.data || {};


    if (getThreadData?.notifyChange?.status !== true) return;

    const typeofCall = logMessageData.video ? 'Video' : '';
    let atlertMsg = null;


    if (logMessageData.event == "group_call_started") {
        const authorName = (await Users.getInfo(logMessageData.caller_id))?.name || logMessageData.caller_id;

        atlertMsg = getLang(`plugins.events.thread-call.started${typeofCall}Call`, {
            authorName: authorName,
            authorId: logMessageData.caller_id
        });
    } else if (logMessageData.event == "group_call_ended") {
        const callDuration = global.msToHMS(logMessageData.call_duration * 1000);

        atlertMsg = getLang(`plugins.events.thread-call.ended${typeofCall}Call`, {
            callDuration: callDuration
        })

    } else if (logMessageData.joining_user) {
        const authorName = (await Users.getInfo(logMessageData.joining_user))?.name || logMessageData.joining_user;

        atlertMsg = getLang(`plugins.events.thread-call.joined${typeofCall}Call`, {
            authorName: authorName,
            authorId: logMessageData.joining_user
        })
    }

    for (const rUID of getThreadData.notifyChange.registered) {
        global.sleep(300);
        api.sendMessage(atlertMsg, rUID, (err) => console.error(err));
    }

    return;
}
