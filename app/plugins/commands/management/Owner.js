'use strict';
export const config = {
    name: "BotManager",
    description: {
        "about": "Basic Commands",
        "commands": {
            "maintenance": "Maintance Bot",
            "monitor": "Set Monitor Server",
            "restart": "Restart Bot",
            "pending": "Approve/Reject pending Group",
            "stats": "Bot Stats"
        }
    },
    usage: {
        "maintenance": "[on/off]",
        "monitor": "[add/del] [TID]",
        "restart": "",
        "pending": "",
        "stats": ""
    },
    credits: "Xavia",
    permissions: [2],
    map: {
        "maintenance": setMaintenance,
        monitor,
        restart,
        pending,
        stats
    },
    dependencies: ['process-stats'],
    cooldown: {
        "maintenance": 5,
        "monitor": 5,
        "restart": 5,
        "pending": 30,
        "stats": 5
    }
}

function setMaintenance({ api, event, args, db }) {
    const { threadID, messageID } = event;
    const input = args[0] ? args[0].toLowerCase() : '';
    const query = input == 'on' ? true : input == 'off' ? false : null;

    if (query == null) {
        if (client.maintenance == true) {
            changeMaintenance(false);
            api.sendMessage('Maintenance mode is now off', threadID, messageID);
        } else {
            changeMaintenance(true);
            api.sendMessage('Maintenance mode is now on', threadID, messageID);
        }
    } else {
        if (query == true) {
            if (client.maintenance == true) {
                api.sendMessage('Maintenance mode is already on', threadID, messageID);
            } else {
                changeMaintenance(true);
                api.sendMessage('Maintenance mode is now on', threadID, messageID);
            }
        } else {
            if (client.maintenance == false) {
                api.sendMessage('Maintenance mode is already off', threadID, messageID);
            } else {
                changeMaintenance(false);
                api.sendMessage('Maintenance mode is now off', threadID, messageID);
            }
        }
    }


    async function changeMaintenance(query) {
        let getSettings = db.get('Admin');
        getSettings.maintenance = query;
        await db.set('Admin', getSettings);
        client.maintenance = query;
        return true;
    }

    return;
}

async function monitor({ api, event, args, db }) {
    const { threadID, messageID } = event;
    const query = args[0] ? args[0].toLowerCase() : '';
    if (query == 'add') {
        const tid = args[1] || threadID;
        if (parseInt(tid) == NaN && isNaN(parseInt(tid))) {
            api.sendMessage('Invalid TID', threadID, messageID);
        } else {
            if (client.data.monitorServers.includes(tid)) {
                api.sendMessage('This TID is already a monitor server', threadID, messageID);
            } else {
                api.sendMessage('Testing...', tid, async (err) => {
                    if (err) {
                        api.sendMessage('This TID is not a valid server', threadID, messageID);
                    } else {
                        const getSettings = db.get('Admin');
                        let monitorServersSetting = getSettings.monitorServers || [];
                        if (!monitorServersSetting.includes(tid)) {
                            monitorServersSetting.push(tid);
                        }
                        getSettings.monitorServers = monitorServersSetting;
                        await db.set('Admin', getSettings);
                        client.data.monitorServers.push(tid);

                        api.sendMessage('This TID is now a monitor server', tid, messageID);
                    }
                })
            }
        }
    } else if (query == 'del') {
        const tid = args[1] || threadID;
        if (parseInt(tid) == NaN && isNaN(parseInt(tid))) {
            api.sendMessage('Invalid TID', threadID, messageID);
        } else {
            if (!client.data.monitorServers.includes(tid)) {
                api.sendMessage('This TID is not a monitor server', threadID, messageID);
            } else {
                const getSettings = db.get('Admin');
                let monitorServersSetting = db.get('Admin')['monitorServers'] || [];
                if (monitorServersSetting.includes(tid)) {
                    monitorServersSetting.splice(monitorServersSetting.indexOf(tid), 1);
                }
                getSettings['monitorServers'] = monitorServersSetting;
                await db.set('Admin', getSettings);
                client.data.monitorServers.splice(client.data.monitorServers.indexOf(tid), 1);
                api.sendMessage('This TID is no longer a monitor server', tid, messageID);
            }
        }
    } else {
        api.sendMessage('Invalid query, please use add/del', threadID, messageID);
    }

    return;
}

function restart({ api, event }) {
    api.sendMessage('Restarting...', event.threadID, () => process.exit(1));
}

async function pending({ api, event }) {
    const { threadID, messageID } = event;
    var msg = "";

    try {
        var SPAM = await api.getThreadList(100, null, ["OTHER"]) || [];
        var PENDING = await api.getThreadList(100, null, ["PENDING"]) || [];

        const list = [...SPAM, ...PENDING].filter(group => group.isSubscribed && group.isGroup);
        msg += list.map((group, index) => `${index + 1}. ${group.name} (${group.threadID}`).join('\n');
        api.sendMessage(
            body,
            threadID,
            (err, info) => {
                client.replies.push({
                    messageID: info.messageID,
                    type: 'pending',
                    list,
                    author: event.senderID
                })
            }
        )
    } catch (e) {
        api.sendMessage('Can\'t get Threads List...', threadID, messageID);
    }

    return;
}

async function stats({ api, event, controllers }) {
    const procStats = libs['process-stats']();
    const { memTotal, memFree, uptime, memUsed } = procStats();
    procStats.destroy();

    const servedThreads = await controllers.Threads.getAll() || [];
    const servingThreads = servedThreads.filter(thread => thread.info.isSubscribed == true) || [];

    let msg = `
    Memory: ${((memTotal.value - memFree.value) / 1073741824).toFixed(2)} GB / ${memTotal.pretty} (${memUsed.pretty} used)
    Uptime: ${uptime.pretty}
    Serving: ${servingThreads.length} Group(s)
    Served: ${servedThreads.length} Group(s)
    TotalMonitors: ${Object.keys(client.data.monitorServerPerThread).length + client.data.monitorServers.length} Server(s)
    AdminMonitors: ${client.data.monitorServers.length} Server(s)
    `.replace(/^ +/gm, '');

    api.sendMessage(msg, event.threadID, event.messageID);
    return;
}
