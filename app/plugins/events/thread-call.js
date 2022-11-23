export default async function ({ api, event, db, controllers }) {
    const { threadID, logMessageData } = event;
    const { Users } = controllers;



    const getMonitorServerPerThread = client.data.monitorServerPerThread;

    if (!getMonitorServerPerThread[threadID]) return;

    const typeofCall = logMessageData.video ? 'Video' : '';
    let atlertMsg = null,
        monitorID = getMonitorServerPerThread[threadID];


    if (logMessageData.event == "group_call_started") {
        const authorName = await Users.getName(logMessageData.caller_id);

        atlertMsg = getLang(`plugins.events.thread-call.started${typeofCall}Call`, {
            authorName: authorName,
            authorId: logMessageData.caller_id
        })
    } else if (logMessageData.event == "group_call_ended") {
        const callDuration = transformTime(logMessageData.call_duration);

        atlertMsg = getLang(`plugins.events.thread-call.ended${typeofCall}Call`, {
            callDuration: callDuration
        })

    } else if (logMessageData.joining_user) {
        const authorName = await Users.getName(logMessageData.joining_user);

        atlertMsg = getLang(`plugins.events.thread-call.joined${typeofCall}Call`, {
            authorName: authorName,
            authorId: logMessageData.joining_user
        })
    }

    api.sendMessage(atlertMsg, monitorID);


    return;
}

function transformTime(time) {
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor((time - (hours * 3600)) / 60);
    let seconds = time - (hours * 3600) - (minutes * 60);

    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    return `${hours}:${minutes}:${seconds}`;
}
