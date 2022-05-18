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

export const langData = {
    "en_US": {
        "maintenance.on": "Maintenance mode is now on",
        "maintenance.off": "Maintenance mode is now off",
        "maintenance.alreadyOn": "Maintenance mode is already on",
        "maintenance.alreadyOff": "Maintenance mode is already off",
        "monitor.add.error.invalidTID": "Invalid TID",
        "monitor.add.error.alreadyMonitor": "This TID is already a monitor server",
        "monitor.add.test": "Testing server...",
        "monitor.add.error.invalidServer": "This TID is not a valid server",
        "monitor.add.success": "This thread is now a monitor server",
        "monitor.del.error.invalidTID": "Invalid TID",
        "monitor.del.error.notMonitor": "This TID is not a monitor server",
        "monitor.del.success": "This TID is no longer a monitor server",
        "monitor.error.invalidQuery": "Invalid Query, use `add` or `del`",
        "restart": "Restarting...",
        "pending.error.emptyList": "Can\'t get Threads List...",
        "stats.body": `
            Memory (RAM): {totalMemoryUsed} / {totalMemory} GB ({processMemoryUsed} used)
            Uptime: {uptimePretty}
            Serving: {serving} Group(s)
            Served: {served} Group(s)
            TotalMonitors: {totalMonitors} Server(s)
            ModeratorMonitors: {moderatorMonitors} Server(s)
        `
    },
    "vi_VN": {
        "maintenance.on": "Đã bật chế độ bảo trì",
        "maintenance.off": "Đã tắt chế độ bảo trì",
        "maintenance.alreadyOn": "Chế độ bảo trì đã được bật từ trước",
        "maintenance.alreadyOff": "Chế độ bảo trì đã được tắt từ trước",
        "monitor.add.error.invalidTID": "TID không hợp lệ",
        "monitor.add.error.alreadyMonitor": "TID này đã là máy chủ quản lý",
        "monitor.add.test": "Đang kiểm tra máy chủ...",
        "monitor.add.error.invalidServer": "TID này không phải là máy chủ hợp lệ",
        "monitor.add.success": "Máy chủ này đã trở thành máy chủ quản lý",
        "monitor.del.error.invalidTID": "TID không hợp lệ",
        "monitor.del.error.notMonitor": "TID này không phải là máy chủ quản lý",
        "monitor.del.success": "Máy chủ này không còn là máy chủ quản lý",
        "monitor.error.invalidQuery": "Lựa chọn không hợp lệ, hãy sử dụng `add` hoặc `del`",
        "restart": "Đang khởi động lại...",
        "pending.error.emptyList": "Không thể lấy danh sách các nhóm chờ...",
        "stats.body": `
            Bộ nhớ (RAM): {totalMemoryUsed} / {totalMemory} GB ({processMemoryUsed} đã sử dụng)
            Thời gian hoạt động: {uptimePretty}
            Đang phục vụ: {serving} nhóm
            Đã phục vụ: {served} nhóm
            Tổng số máy chủ quản lý: {totalMonitors} máy chủ
            Máy chủ quản lý của người quản lý: {moderatorMonitors} máy chủ
        `
    }
}

function setMaintenance({ api, event, args, getLang, db }) {
    const { threadID, messageID } = event;
    const input = args[0] ? args[0].toLowerCase() : '';
    const query = input == 'on' ? true : input == 'off' ? false : null;

    if (query == null) {
        if (client.maintenance == true) {
            changeMaintenance(false);
            api.sendMessage(getLang('maintenance.off'), threadID, messageID);
        } else {
            changeMaintenance(true);
            api.sendMessage(getLang('maintenance.on'), threadID, messageID);
        }
    } else {
        if (query == true) {
            if (client.maintenance == true) {
                api.sendMessage(getLang('maintenance.alreadyOn'), threadID, messageID);
            } else {
                changeMaintenance(true);
                api.sendMessage(getLang('maintenance.on'), threadID, messageID);
            }
        } else {
            if (client.maintenance == false) {
                api.sendMessage(getLang('maintenance.alreadyOff'), threadID, messageID);
            } else {
                changeMaintenance(false);
                api.sendMessage(getLang('maintenance.off'), threadID, messageID);
            }
        }
    }


    async function changeMaintenance(query) {
        let getSettings = await db.get('Moderator');
        getSettings.maintenance = query;
        await db.set('Moderator', getSettings);
        client.maintenance = query;
        return true;
    }

    return;
}

async function monitor({ api, event, args, getLang, db }) {
    const { threadID, messageID } = event;
    const query = args[0] ? args[0].toLowerCase() : '';
    if (query == 'add') {
        const tid = args[1] || threadID;
        if (parseInt(tid) == NaN && isNaN(parseInt(tid))) {
            api.sendMessage(getLang('monitor.add.error.invalidTID'), threadID, messageID);
        } else {
            if (client.data.monitorServers.includes(tid)) {
                api.sendMessage(getLang('monitor.add.error.alreadyMonitor'), threadID, messageID);
            } else {
                api.sendMessage(getLang('monitor.add.test'), tid, async (err) => {
                    if (err) {
                        api.sendMessage(getLang('monitor.add.error.invalidServer'), threadID, messageID);
                    } else {
                        const getSettings = await db.get('Moderator');
                        let monitorServersSetting = getSettings.monitorServers || [];
                        if (!monitorServersSetting.includes(tid)) {
                            monitorServersSetting.push(tid);
                        }
                        getSettings.monitorServers = monitorServersSetting;
                        await db.set('Moderator', getSettings);
                        client.data.monitorServers.push(tid);

                        api.sendMessage(getLang('monitor.add.success'), tid, messageID);
                    }
                });
            }
        }
    } else if (query == 'del') {
        const tid = args[1] || threadID;
        if (parseInt(tid) == NaN && isNaN(parseInt(tid))) {
            api.sendMessage(getLang('monitor.del.error.invalidTID'), threadID, messageID);
        } else {
            if (!client.data.monitorServers.includes(tid)) {
                api.sendMessage(getLang('monitor.del.error.notMonitor'), threadID, messageID);
            } else {
                const getSettings = await db.get('Moderator');
                let monitorServersSetting = await db.get('Moderator')['monitorServers'] || [];
                if (monitorServersSetting.includes(tid)) {
                    monitorServersSetting.splice(monitorServersSetting.indexOf(tid), 1);
                }
                getSettings['monitorServers'] = monitorServersSetting;
                await db.set('Moderator', getSettings);
                client.data.monitorServers.splice(client.data.monitorServers.indexOf(tid), 1);
                api.sendMessage(getLang('monitor.del.success'), tid, messageID);
            }
        }
    } else {
        api.sendMessage(getLang('monitor.error.invalidQuery'), threadID, messageID);
    }

    return;
}

function restart({ api, event, getLang }) {
    api.sendMessage(getLang('restart'), event.threadID, () => process.exit(1));
}

async function pending({ api, event, getLang }) {
    const { threadID, messageID } = event;
    var msg = "";

    try {
        var SPAM = await api.getThreadList(100, null, ["OTHER"]) || [];
        var PENDING = await api.getThreadList(100, null, ["PENDING"]) || [];

        const list = [...SPAM, ...PENDING].filter(group => group.isSubscribed && group.isGroup);
        msg += list.map((group, index) => `${index + 1}. ${group.name} (${group.threadID}`).join('\n');
        api.sendMessage(
            msg,
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
        api.sendMessage(getLang('pending.error.emptyList'), threadID, messageID);
    }

    return;
}

async function stats({ api, event, getLang, controllers }) {
    const procStats = libs['process-stats']();
    const { memTotal, memFree, uptime, memUsed } = procStats();
    procStats.destroy();

    const servedThreads = await controllers.Threads.getAll() || [];
    const servingThreads = servedThreads.filter(thread => thread.info.isSubscribed == true) || [];

    let msg = getLang('stats.body', {
        totalMemoryUsed: ((memTotal.value - memFree.value) / 1073741824).toFixed(2),
        totalMemory: (memTotal.value / 1073741824).toFixed(2),
        processMemoryUsed: memUsed.pretty,
        uptimePretty: uptime.pretty,
        serving: servingThreads.length,
        served: servedThreads.length,
        totalMonitors: Object.keys(client.data.monitorServerPerThread).length + client.data.monitorServers.length,
        moderatorMonitors: client.data.monitorServers.length
    }).replace(/^ +/gm, '');

    api.sendMessage(msg, event.threadID, event.messageID);
    return;
}
