const path = client.mainPath + '/plugins/cache/count';
const path_backup = client.mainPath + '/plugins/cache/count/bak';
const ensurePathExists = () => {
    if (!isExists(path, "dir")) {
        mkdir(path);
    }
    if (!isExists(path_backup, "dir")) {
        mkdir(path_backup);
    }
}

export const info = {
    name: "group",
    about: "commands for group",
    credits: "Xavia",
    onLoad: () => {
        try {
            ensurePathExists();
            const allCountData = scanDir(path).filter(file => file.endsWith(".json")) || [];

            for (let i = 0; i < allCountData.length; i++) {
                const _reader = reader(`${path}/${allCountData[i]}`);
                _reader.on("data", data => {
                    if (!isJSON(data.toString())) {
                        const _reader_bk = reader(`${path_backup}/${allCountData[i]}`);
                        _reader_bk.on("data", data_bk => {
                            if (!isJSON(data_bk.toString())) {
                                const _writer = writer(`${path}/${allCountData[i]}`);
                                _writer.write("[]", (e) => {
                                    _writer.destroy();
                                    _reader.destroy();
                                    _reader_bk.destroy();
                                    if (e) throw e;
                                });
                            } else {
                                const _writer = writer(`${path}/${allCountData[i]}`);
                                _writer.write(JSON.stringify(JSON.parse(data_bk.toString()), null, 2), 'utf8', (e) => {
                                    _writer.destroy();
                                    _reader_bk.destroy();
                                    _reader.destroy();
                                    if (e) throw e;
                                });
                            }
                        });
                    } else {
                        const _writer_bk = writer(`${path_backup}/${allCountData[i]}`);
                        _writer_bk.write(JSON.stringify(JSON.parse(data.toString()), null, 2), 'utf8', (e) => {
                            _writer_bk.destroy();
                            _reader.destroy();
                            if (e) throw e;
                        })
                    }
                })
            }
        } catch (e) {
            console.error(e);
        }
    }
}

export const langData = {
    "en_US": {
        "count.description": "Check the interaction of members",
        "count.notReady": "User data is not ready",
        "count.result": "{count} messages (#{rank})",
        "count.all": "==== MESSAGES COUNT ====\n{data}",
        "filter.result": "Removed {success} users, failed: {fail}",
        "filter.notAdmin": "Bot must be admin to use this command",
        "filter.wrongQuery": 'Must be "fbuser" or number',
        "filter.notReady": "User data is not ready",
        "any.error": "An error occurred",
    },
    "vi_VN": {
        "count.description": "Kiểm tra tương tác của thành viên",
        "count.notReady": "Dữ liệu người dùng chưa sẵn sàng",
        "count.result": "{count} tin nhắn (#{rank})",
        "count.all": "==== SỐ LƯỢNG TIN NHẮN ====\n{data}",
        "filter.result": "Đã loại bỏ {success} người dùng, thất bại: {fail}",
        "filter.notAdmin": "Bot phải là quản trị viên để sử dụng lệnh này",
        "filter.wrongQuery": 'Phải là "fbuser" hoặc số',
        "filter.notReady": "Dữ liệu người dùng chưa sẵn sàng",
        "any.error": "Đã xảy ra lỗi",
    }
}

function onMessage({ message }) {
    try {
        ensurePathExists();
        const { threadID, senderID } = message;
        const threadDataPath = `${path}/${threadID}.json`;
        if (!isExists(threadDataPath, 'file')) {
            const _writer = writer(threadDataPath);

            _writer.write('[]', 'utf8', () => {
                _writer.destroy();
                callback();
            });
        } else {
            callback();
        }

        function callback() {
            const _reader = reader(threadDataPath);

            _reader.on("data", data => {
                const _data = JSON.parse(data.toString());
                const userIndex = _data.findIndex(user => user.id === senderID);
                if (userIndex === -1) {
                    _data.push({
                        id: senderID,
                        count: 1
                    });
                } else _data[userIndex].count++;

                const _writer = writer(threadDataPath);
                _writer.write(JSON.stringify(_data, null, 2), 'utf8', (err) => {
                    _writer.destroy();
                    _reader.destroy();
                    if (err) throw err;
                });
            });
        }
    } catch (e) {
        console.error(e);
    }
}

function count() {
    const config = {
        name: "count",
        aliases: ["checktt"],
        version: "1.0.0",
        description: getLang("count.description", null, info.name),
        usage: "[all]",
        permissions: 2,
        cooldown: 5
    }

    const onCall = async ({ message, args, controllers, getLang }) => {
        const { reply, threadID, senderID, messageReply } = message;

        try {
            ensurePathExists();
            const threadDataPath = `${path}/${threadID}.json`;
            if (!isExists(threadDataPath, 'file')) {
                reply(getLang("count.notReady"));
            } else {
                const query = args[0]?.toLowerCase() || null;
                const _reader = reader(threadDataPath);
                _reader.on("data", async data => {
                    const _data = JSON.parse(data.toString());

                    _data.sort((a, b) => b.count === a.count ? a.id.localeCompare(b.id) : b.count - a.count);

                    if (query == "all") {
                        const threadInfo = (await controllers.Threads.getInfo(threadID)) || {};
                        const allUIDs = _data.map(user => user.id);

                        for (let i = 0; i < threadInfo.participantIDs.length; i++) {
                            const userID = threadInfo.participantIDs[i];
                            if (!allUIDs.some(uid => uid === userID)) {
                                allUIDs.push(userID);
                                _data.push({
                                    id: userID,
                                    count: 0
                                });
                            }
                        }

                        const allUNames = [];
                        for (let i = 0; i < allUIDs.length; i++) {
                            const username = (await controllers.Users.getName(allUIDs[i])) || "Facebook User";
                            allUNames.push(username);
                        }

                        if (allUIDs.length > 0) {
                            reply(getLang("count.all", { data: allUIDs.map((uid, index) => `${index + 1}. ${allUNames[index]} - ${_data[index].count}`).join("\n") }));
                        } else {
                            reply(getLang("count.notReady"));
                        }
                    } else {
                        const targetID = messageReply ? messageReply.senderID : senderID;
                        const targetIndex = _data.findIndex(user => user.id === targetID);

                        if (targetIndex === -1) {
                            reply(getLang("count.notReady"));
                        } else {
                            reply(getLang("count.result", { count: _data[targetIndex].count, rank: targetIndex + 1 }));
                        }
                    }
                });
            }
        } catch (e) {
            console.error(e);
            reply(getLang("count.notReady"));
        }

        return;
    }
    return { config, onCall };
}

function filter() {
    const config = {
        name: "filter",
        aliases: ["locmem", "loc"],
        version: "1.0.0",
        description: getLang("filter.description", null, info.name),
        usage: "[fbuser/count]",
        permissions: [1],
        cooldown: 20
    }

    const onCall = async ({ api, message, args, getLang, controllers }) => {
        const { reply, threadID, senderID } = message;
        const { Threads } = controllers;
        const query = args[0]?.toLowerCase() || null;
        const threadDataPath = `${path}/${threadID}.json`;

        ensurePathExists();
        if (!isExists(threadDataPath, 'file')) {
            reply(getLang("filter.notReady"));
        } else {
            if (query == "fbuser") {
                const threadInfo = await api.getThreadInfo(threadID) || {};
                const adminIDs = threadInfo.adminIDs || [];
                if (!adminIDs.some(admin => admin.id === botID)) {
                    reply(getLang("filter.notAdmin"));
                } else {
                    const _reader = reader(threadDataPath);
                    _reader.on("data", async data => {
                        const userInfo = (threadInfo.userInfo || []).filter(user => user.id !== senderID && user.id !== botID && !user.gender);
                        const _data = [...JSON.parse(data.toString())];
                        const filteredData = _data.filter(user => !userInfo.some(userr => userr.id === user.id));

                        const _writer = writer(threadDataPath);
                        _writer.write(JSON.stringify(filteredData, null, 2), 'utf8', async (err) => {
                            _writer.destroy();
                            _reader.destroy();
                            if (err) throw err;
                            else {
                                const promises = userInfo.map((user, index) => {
                                    return new Promise((resolve, reject) => setTimeout(async () => {
                                        api.removeUserFromGroup(user.id, threadID, (err, data) => {
                                            if (err) reject(err);
                                            else resolve();
                                        });
                                    }, 1000 * index));
                                });

                                const count = (await Promise.allSettled(promises)).reduce((acc, cur) => cur.status === "fulfilled" ? acc + 1 : acc, 0);
                                reply(getLang("filter.result", { success: count, fail: promises.length - count }));
                            }
                        });
                    })
                }
            } else {
                if (!query || isNaN(query)) {
                    reply(getLang("filter.wrongQuery"));
                } else {
                    const minCount = parseInt(query) || 5;
                    const threadInfo = (await Threads.getInfo(threadID)) || {};
                    const adminIDs = threadInfo.adminIDs || [];
                    if (!adminIDs.some(admin => admin.id === botID)) {
                        reply(getLang("filter.notAdmin"));
                    } else {
                        try {
                            const _reader = reader(threadDataPath);
                            _reader.on("data", async data => {
                                const _data = [...JSON.parse(data.toString())];
                                const allUIDs = _data.map(user => user.id);

                                for (let i = 0; i < threadInfo.participantIDs.length; i++) {
                                    const userID = threadInfo.participantIDs[i];
                                    if (!allUIDs.some(uid => uid === userID)) {
                                        allUIDs.push(userID);
                                        _data.push({
                                            id: userID,
                                            count: 0
                                        });
                                    }
                                }

                                const _data_to_be_removed = [..._data].filter(user => user.count < minCount && user.id !== senderID && user.id !== botID);
                                const _data_left = [..._data].filter(user => user.count >= minCount || user.id === senderID || user.id === botID);

                                const _writer = writer(threadDataPath);
                                _writer.write(JSON.stringify(_data_left, null, 2), 'utf8', async (err) => {
                                    _writer.destroy();
                                    _reader.destroy();
                                    if (err) throw err;
                                    else {
                                        const promises = _data_to_be_removed.map((user, index) => {
                                            return new Promise((resolve, reject) => setTimeout(async () => {
                                                api.removeUserFromGroup(user.id, threadID, async (err, data) => {
                                                    if (err) {
                                                        console.error(err);
                                                        reject(err);
                                                    }
                                                    else resolve();
                                                });
                                            }, 2000 * index));
                                        })

                                        const count = (await Promise.allSettled(promises)).reduce((acc, cur) => cur.status === "fulfilled" ? acc + 1 : acc, 0);
                                        reply(getLang("filter.result", { success: count, fail: promises.length - count }));
                                    }
                                });
                            });
                        } catch (e) {
                            console.error(e);
                            reply(getLang("any.error"));
                        }
                    }
                }
            }
        }

        return;
    }

    return { config, onCall };
}


export const scripts = {
    commands: {
        count,
        filter
    },
    onMessage
}
