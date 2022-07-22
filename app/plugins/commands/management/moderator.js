export const info = {
    name: "BotManager",
    about: "Basic bot management commands",
    credits: "Xavia",
    dependencies: ['process-stats']
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
        "pending.reply.approved": "Your group has been approved!\n\n{NAME} connected.\nUse {PREFIX}help to see all commands.",
        "pending.reply.rejected": "Your group has been rejected!",
        "pending.reply.error.invalidQuery": "Invalid query, please use approve/reject",
        "pending.reply.approve.success": "Approved {SUCCESS} group(s):\n{SUCCESS_LIST}",
        "pending.reply.reject.success": "Rejected {SUCCESS} group(s):\n{SUCCESS_LIST}",
        "pending.reply.approve.failed": "Failed to approve {FAILED} group(s):\n{FAILED_LIST}",
        "pending.reply.reject.failed": "Failed to reject {FAILED} group(s):\n{FAILED_LIST}",
        "stats.body": `
            Memory (RAM): {totalMemoryUsed} / {totalMemory} GB ({processMemoryUsed} used)
            Uptime: {uptimePretty}
            Serving: {serving} Group(s)
            Served: {served} Group(s)
            TotalMonitors: {totalMonitors} Server(s)
            ModeratorMonitors: {moderatorMonitors} Server(s)
        `,
        "any.error": "Something went wrong, try again later...",
        "maintenance.description": "Set Bot Maintenance Mode",
        "monitor.description": "Add/Remove Monitor Server",
        "restart.description": "Restart Bot",
        "pending.description": "Approve/Reject Pending Groups",
        "stats.description": "Get Bot Stats",
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
        "pending.reply.approved": "Nhóm của bạn đã được phê duyệt!\n\n{NAME} đã kết nối.\nSử dụng {PREFIX}help để xem danh sách lệnh.",
        "pending.reply.rejected": "Nhóm của bạn đã bị từ chối!",
        "pending.reply.error.invalidQuery": "Lựa chọn không hợp lệ, dùng: approve/reject",
        "pending.reply.approve.success": "Đã phê duyệt {SUCCESS} nhóm:\n{SUCCESS_LIST}",
        "pending.reply.reject.success": "Đã từ chối {SUCCESS} nhóm:\n{SUCCESS_LIST}",
        "pending.reply.approve.failed": "Không thể phê duyệt {FAILED} nhóm:\n{FAILED_LIST}",
        "pending.reply.reject.failed": "Không thể từ chối {FAILED} nhóm:\n{FAILED_LIST}",
        "stats.body": `
            Bộ nhớ (RAM): {totalMemoryUsed} / {totalMemory} GB ({processMemoryUsed} đã sử dụng)
            Thời gian hoạt động: {uptimePretty}
            Đang phục vụ: {serving} nhóm
            Đã phục vụ: {served} nhóm
            Tổng số máy chủ quản lý: {totalMonitors} máy chủ
            Máy chủ quản lý của người quản lý: {moderatorMonitors} máy chủ
        `,
        "any.error": "Có lỗi xảy ra, hãy thử lại sau...",
        "maintenance.description": "Bật, tắt chế độ bảo trì",
        "monitor.description": "Thêm, xóa máy chủ quản lý",
        "restart.description": "Khởi động lại bot",
        "pending.description": "Xem danh sách nhóm chờ phê duyệt",
        "stats.description": "Xem thống kê bot"
    }
}

async function onReply({ api, message, getLang, controllers, eventData }) {
    const { args, senderID, reply } = message;
    const { Threads } = controllers;

    if (senderID != eventData.author) return;
    if (args.length == 0) return;
    try {
        const { list } = eventData;
        const query = args[0]?.toLowerCase();
        const chosenGroup = args?.slice(1) || [];
        if (chosenGroup.length == 0) {
            reply(getLang('pending.reply.error.invalidQuery'));
            return;
        }

        let succeed = [],
            failed = [],
            msg = null,
            promiseJobs = [];

        if (query == 'approve') {
            for (const i of chosenGroup) {
                if (isNaN(i)) continue;
                if (i - 1 > list.length) continue;
                const group = list[i - 1];
                const getThread = await Threads.checkThread(group.threadID) || {};
                const Prefix = getThread.data.prefix || client.config.PREFIX;
                promiseJobs.push(new Promise(async resolve => {
                    api.sendMessage(
                        getLang('pending.reply.approved', {
                            NAME: client.config.NAME,
                            PREFIX: Prefix
                        }),
                        group.threadID,
                        (err) => {
                            if (err) {
                                console.error(err);
                                failed.push(group.threadID);
                            } else succeed.push(group.threadID);
                            resolve();
                        }
                    );
                }));
            }
        } else if (query == 'reject') {
            for (const i of chosenGroup) {
                if (isNaN(i)) continue;
                if (i - 1 > list.length) continue;
                const group = list[i - 1];
                promiseJobs.push(new Promise(async resolve => {
                    api.sendMessage(
                        getLang('pending.reply.rejected'),
                        group.threadID,
                        (err) => {
                            if (err) {
                                failed.push(group.threadID);
                            } else api.removeUserFromGroup(
                                group.threadID,
                                botID,
                                (err) => {
                                    if (err) {
                                        console.error(err);
                                        failed.push(group.threadID);
                                    } else succeed.push(group.threadID);
                                    resolve();
                                });
                        }
                    );
                }));
            }
        } else {
            reply(getLang('pending.reply.error.invalidQuery'));
            return;
        }

        Promise.all(promiseJobs).then(() => {
            msg = getLang(`pending.reply.${query}.success`, {
                SUCCEED: succeed.length,
                SUCCEED_LIST: succeed.join('\n'),
            });
            if (failed.length > 0) msg += `\n${getLang(`pending.reply.${query}.failed`, {
                FAILED: failed.length,
                FAILED_LIST: failed.join('\n')
            })}`;

            api.unsendMessage(eventData.messageID);
            reply(msg);
        });
    } catch (err) {
        console.error(err);
        reply(getLang('any.error'));
    }
}


function setMaintenance() {
    const config = {
        name: "maintenance",
        aliases: ["maint"],
        description: getLang("maintenance.description", null, info.name),
        usage: "[on/off]",
        permissions: [2],
        cooldown: 5
    }

    const onCall = ({ message, args, getLang, db }) => {
        const { reply } = message;
        const input = args[0]?.toLowerCase();
        const query = input == 'on' ? true : input == 'off' ? false : null;

        if (query == null) {
            if (client.maintenance == true) {
                changeMaintenance(false);
            } else {
                changeMaintenance(true);
            }
        } else {
            if (query == true) {
                if (client.maintenance == true) {
                    reply(getLang('maintenance.alreadyOn'));
                } else {
                    changeMaintenance(true);
                }
            } else {
                if (client.maintenance == false) {
                    reply(getLang('maintenance.alreadyOff'));
                } else {
                    changeMaintenance(false);
                }
            }
        }


        async function changeMaintenance(query) {
            try {
                let getSettings = await db.get('Moderator');
                getSettings.maintenance = query;
                await db.set('Moderator', getSettings);
                client.maintenance = query;

                if (query == true) {
                    reply(getLang('maintenance.on'));
                } else {
                    reply(getLang('maintenance.off'));
                }
            } catch (e) {
                console.error(e);
                reply(getLang('any.error'));
            }

            return;
        }

        return;
    }

    return { config, onCall };
}

function monitor() {
    const config = {
        name: "monitor",
        aliases: ["mntr"],
        description: getLang("monitor.description", null, info.name),
        usage: "[add/del] [TID]",
        permissions: [2],
        cooldown: 10
    }

    const onCall = async ({ api, message, args, getLang, db }) => {
        const { threadID, messageID, reply } = message;
        const query = args[0]?.toLowerCase();
        if (query == 'add') {
            const tid = args[1] || threadID;
            if (isNaN(parseInt(tid))) {
                reply(getLang('monitor.add.error.invalidTID'));
            } else {
                if (client.data.monitorServers.includes(tid)) {
                    reply(getLang('monitor.add.error.alreadyMonitor'));
                } else {
                    api.sendMessage(getLang('monitor.add.test'), tid, async (err) => {
                        if (err) {
                            reply(getLang('monitor.add.error.invalidServer'));
                        } else {
                            try {
                                const getSettings = await db.get('Moderator');
                                let monitorServersSetting = getSettings.monitorServers || [];
                                if (!monitorServersSetting.includes(tid)) {
                                    monitorServersSetting.push(tid);
                                }
                                getSettings.monitorServers = monitorServersSetting;
                                await db.set('Moderator', getSettings);
                                client.data.monitorServers.push(tid);

                                api.sendMessage(getLang('monitor.add.success'), tid, messageID);
                            } catch (e) {
                                console.error(e);
                                reply(getLang('any.error'));
                            }
                        }
                    });
                }
            }
        } else if (query == 'del') {
            const tid = args[1] || threadID;
            if (isNaN(parseInt(tid))) {
                reply(getLang('monitor.del.error.invalidTID'));
            } else {
                if (!client.data.monitorServers.includes(tid)) {
                    reply(getLang('monitor.del.error.notMonitor'));
                } else {
                    try {
                        const getSettings = await db.get('Moderator');
                        let monitorServersSetting = await db.get('Moderator')['monitorServers'] || [];
                        if (monitorServersSetting.includes(tid)) {
                            monitorServersSetting.splice(monitorServersSetting.indexOf(tid), 1);
                        }
                        getSettings['monitorServers'] = monitorServersSetting;
                        await db.set('Moderator', getSettings);
                        client.data.monitorServers.splice(client.data.monitorServers.indexOf(tid), 1);

                        api.sendMessage(getLang('monitor.del.success'), tid, messageID);
                    } catch (e) {
                        console.error(e);
                        reply(getLang('any.error'));
                    }
                }
            }
        } else {
            reply(getLang('monitor.error.invalidQuery'));
        }

        return;
    }

    return { config, onCall };
}

function restart() {
    const config = {
        name: "restart",
        aliases: ["rs", "reboot"],
        description: getLang("restart.description", null, info.name),
        usage: "",
        permissions: [2],
        cooldown: 5
    }

    const onCall = ({ message, getLang }) => {
        message.send(getLang('restart'))
            .then(() => process.exit(1))
            .catch(e => {
                console.error(e);
                message.send(getLang('any.error'));
            });
    }

    return { config, onCall };
}

function pending() {
    const config = {
        name: "pending",
        aliases: ["pnd"],
        description: getLang("pending.description", null, info.name),
        usage: "",
        permissions: [2],
        cooldown: 30
    }

    const onCall = async ({ api, message, getLang }) => {
        const { reply, send } = message;
        let msg = "";

        try {
            const SPAM = await api.getThreadList(100, null, ["OTHER"]) || [];
            const PENDING = await api.getThreadList(100, null, ["PENDING"]) || [];

            const list = [...SPAM, ...PENDING].filter(group => group.isSubscribed && group.isGroup);
            msg += list.map((group, index) => `${index + 1}. ${group.name} (${group.threadID}`).join('\n');
            send(msg)
                .then(data => {
                    data.addReplyEvent({ list });
                })
                .catch(e => {
                    console.error(e);
                    send(getLang('any.error'));
                })

        } catch (e) {
            reply(getLang('pending.error.emptyList'));
        }

        return;
    }

    return { config, onCall };
}

function stats() {
    const config = {
        name: "stats",
        aliases: ["st"],
        description: getLang("stats.description", null, info.name),
        usage: "",
        permissions: [2],
        cooldown: 5
    }

    const onCall = async ({ message, getLang, controllers }) => {
        try {
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

            message.reply(msg);
        } catch (e) {
            console.error(e);
            message.reply(getLang('any.error'));
        }

        return;
    }

    return { config, onCall };
}


export const scripts = {
    commands: {
        setMaintenance,
        monitor,
        restart,
        pending,
        stats
    },
    onReply
}
