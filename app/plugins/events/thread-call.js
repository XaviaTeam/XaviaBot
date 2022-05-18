export default async function ({ api, event, db, controllers }) {
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = controllers;



    const getMonitorServerPerThread = client.data.monitorServerPerThread;

    if (!getMonitorServerPerThread[threadID]) return;

    const typeofCall = logMessageData.video ? 'video ' : '';
    let atlertMsg = null,
        monitorID = getMonitorServerPerThread[threadID];


    if (logMessageData.event == "group_call_started") {
        const authorName = await Users.getName(logMessageData.caller_id);

        atlertMsg = '"_author_" has started a _typeofCall_call.';
        atlertMsg = atlertMsg.replace('_author_', `${authorName}`).replace('_typeofCall_', typeofCall);
    } else if (logMessageData.event == "group_call_ended") {
        const callDuration = transformTime(logMessageData.call_duration);

        atlertMsg = '_typeofCall_Call has ended, duration: _time_';
        atlertMsg = atlertMsg.replace('_typeofCall_', typeofCall).replace('_time_', callDuration);

    } else if (logMessageData.joining_user) {
        const authorName = await Users.getName(logMessageData.joining_user);

        atlertMsg = '"_author_" has joined the _typeofCall_call.';
        atlertMsg = atlertMsg.replace('_author_', `${authorName}`).replace('_typeofCall_', typeofCall);
    }

    api.sendMessage(atlertMsg, monitorID);


    return;
}

function transformTime(time) {
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor((time - (hours * 3600)) / 60);
    let seconds = time - (hours * 3600) - (minutes * 60);

    //Add 0 if less than 10
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    return `${hours}:${minutes}:${seconds}`;
}
