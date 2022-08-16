const _24HOURS = 24 * 60 * 60 * 1000;
const _2HOURS = 2 * 60 * 60 * 1000;

export const info = {
    name: "Economy",
    about: "Economy system",
    extra: {
        daily: {
            min: 100,
            max: 500,
            bonus_7_days: 200
        },
        work: {
            min: 100,
            max: 500,
            workCooldown: _2HOURS
        },
        money: {
            sendTax: 0.05
        }
    }
}

export const langData = {
    "en_US": {
        "money.description": "Get, send, change (for moderators) money of self or other user.",
        "money.noData": "Nothing found, try again later.",
        "money.change": "{name} ({moneyChange} XC)",
        "money.self.change": "You ({moneyChange} XC)",
        "money.self.set": "Your balance is now {money} XC",
        "money.set": "{name}'s balance is now {money} XC",
        "money.isNaN": "Invalid number.",
        "money.noPermission": "You don't have permission to change money.",
        "money.noTarget": "Please mention or reply to someone.",
        "money.notEnough": "You don't have enough money.",
        "money.send": "Sent {money} XC to {name}",
        "daily.description": "Get daily reward.",
        "daily.alreadyClaimed": "You already claimed your daily reward, come back again after {time}.",
        "daily.getWithBonus": "You got {moneyGet} XC!\nThis is your 7th day, you got a bonus of {moneyBonus} XC!",
        "daily.get": "You got {moneyGet} XC!",
        "work.description": "Work for money.",
        "work.get": "You worked hard and got {moneyGet} XC!",
        "work.inCooldown": "You can't work now, try again after {time}.",
        "any.error": "An error has occurred, try again later.",
        "economy.dataNotReady": "User data is not ready, try again later."
    },
    "vi_VN": {
        "money.description": "Xem, gửi, thay đổi (cho moderators) tiền của bạn hoặc người dùng khác.",
        "money.noData": "Không tìm thấy dữ liệu nào, hãy thử lại sau.",
        "money.change": "{name} ({moneyChange} XC)",
        "money.self.change": "Bạn ({moneyChange} XC)",
        "money.self.set": "Đã thay đổi số dư của bạn thành {money} XC",
        "money.set": "Đã thay đổi số dư của {name} thành {money} XC",
        "money.isNaN": "Số không hợp lệ.",
        "money.noPermission": "Bạn không có quyền thay đổi số dư.",
        "money.noTarget": "Hãy gắn thẻ hoặc trả lời tin nhắn ai đó.",
        "money.notEnough": "Bạn không có đủ tiền.",
        "money.send": "Đã gửi {money} XC cho {name}",
        "daily.description": "Nhận thưởng hàng ngày.",
        "daily.alreadyClaimed": "Bạn đã nhận thưởng hôm nay rồi, quay lại sau {time}.",
        "daily.getWithBonus": "Bạn đã nhận {moneyGet} XC!\nĐã nhận đủ 7 ngày nên được thưởng thêm {moneyBonus} XC!",
        "daily.get": "Bạn đã nhận {moneyGet} XC!",
        "work.description": "Làm việc kiếm tiền.",
        "work.get": "Bạn đã làm việc chăm chỉ và đã nhận {moneyGet} XC!",
        "work.inCooldown": "Bạn không thể làm việc bây giờ, hãy thử lại sau {time}.",
        "any.error": "Có lỗi xảy ra, hãy thử lại sau.",
        "economy.dataNotReady": "Dữ liệu người dùng không sẵn sàng, hãy thử lại sau."
    }
}


function money() {
    const config = {
        name: "money",
        aliases: ["money", "balance", "bal", "wallet"],
        version: "1.0.1",
        description: getLang("money.description", null, info.name),
        usage: "[@tag]/[send/inc/dec/set] [@tag] [amount]",
        permissions: 2,
        cooldown: 5
    }

    const onCall = async ({ message, args, controllers, getLang, userPermissions }) => {
        const { Users } = controllers;
        const { senderID, mentions, reply } = message;
        try {
            if (args[0] && ["inc", "increase", "dec", "decrease", "set"].some(e => args[0] == e)) {
                if (userPermissions.some(e => e == 2)) {
                    args[0] = args[0].toLowerCase();
                    const targetID = Object.keys(mentions).length == 0 ? message.type == "message_reply" ? message.messageReply.senderID : senderID : Object.keys(mentions)[0];
                    const userData = await Users.getData(targetID) || {};
                    const userMoney = userData.money || 0;

                    if (!isDataReady(userData)) {
                        reply(getLang("economy.dataNotReady"));
                    } else {
                        const moneyChange = ["inc", "increase", "set"].some(e => args[0] == e) ?
                            parseInt(args[args.length - 1]) :
                            parseInt(args[args.length - 1]) * -1;

                        if (moneyChange && !isNaN(moneyChange)) {
                            const newMoney = args[0] == "set" ? moneyChange : userMoney + moneyChange;

                            userData.money = newMoney;
                            await Users.setData(targetID, userData);
                            const userName = Object.keys(mentions).length == 0 ? "you" : mentions[Object.keys(mentions)[0]].replace(/@/g, '');
                            const msg = args[0] == "set" ?
                                userName == "you" ?
                                    getLang("money.self.set", { money: addCommas(newMoney) }) :
                                    getLang("money.set", { name: userName, money: addCommas(newMoney) }) :
                                userName == "you" ?
                                    getLang("money.self.change", { moneyChange: addCommas(moneyChange > 0 ? "+" + moneyChange : moneyChange) }) :
                                    getLang("money.change", { name: userName, moneyChange: addCommas(moneyChange > 0 ? "+" + moneyChange : moneyChange) });

                            reply(msg);
                        } else {
                            reply(getLang("money.isNaN"));
                        }
                    }
                } else {
                    reply(getLang("money.noPermission"));
                }
            } else if (args[0] == "send") {
                if (message.type !== "message_reply" && Object.keys(message.mentions).length == 0) {
                    reply(getLang("money.noTarget"));
                } else {
                    const targetID = message.type == "message_reply" ? message.messageReply.senderID : Object.keys(message.mentions)[0];
                    const targetData = await Users.getData(targetID) || {};
                    const targetMoney = targetData.money || 0;

                    const userData = await Users.getData(senderID) || {};
                    const userMoney = userData.money || 0;

                    if (!isDataReady(userData) || !isDataReady(targetData)) {
                        reply(getLang("economy.dataNotReady"));
                    } else {
                        const sendAmount = parseInt(args[args.length - 1]) * (1 + client.configPlugins[info.name][config.name].sendTax)

                        if (sendAmount && !isNaN(sendAmount)) {
                            if (sendAmount > userMoney) {
                                reply(getLang("money.notEnough"));
                            } else {
                                userData.money = userMoney - sendAmount;
                                targetData.money = targetMoney + sendAmount;
                                await Users.setData(senderID, userData);
                                await Users.setData(targetID, targetData);
                                const targetName = await Users.getName(targetID);
                                reply(getLang("money.send", { name: targetName, money: addCommas(sendAmount) }));
                            }
                        }
                    }
                }
            } else {
                const targetIDs = Object.keys(mentions).length == 0 ? [senderID] : Object.keys(mentions);

                let getSuccess = 0, arraySuccess = [];
                for (const targetID of targetIDs) {
                    const userData = await Users.getData(targetID) || {};
                    if (Object.keys(userData).length < 1) {
                        continue;
                    } else {
                        getSuccess++;
                        const userMoney = addCommas(userData.money || 0);
                        const userName = await Users.getName(targetID);

                        arraySuccess.push(`${userName} - ${userMoney} XC`);
                    }
                }

                if (getSuccess < 1) {
                    reply(getLang("money.noData"));
                } else {
                    reply(arraySuccess.join("\n"));
                }
            }
        } catch (e) {
            reply(getLang("any.error"));
            console.error(e);
        }

        return;
    }

    return { config, onCall };
}

function daily() {
    const config = {
        name: "daily",
        aliases: [],
        version: "1.0.0",
        description: getLang("daily.description", null, info.name),
        usage: "",
        permissions: 2,
        cooldown: 10
    }

    const onCall = async ({ message, controllers, getLang }) => {
        const { Users } = controllers;
        const { senderID, reply } = message;
        const { min, max, bonus_7_days } = client.configPlugins[info.name][config.name];
        const moneyGet = random(min, max);

        try {

            const userData = await Users.getData(senderID) || {};
            const timeNow = Date.now();
            if (!isDataReady(userData)) {
                reply(getLang("economy.dataNotReady"));
            } else {
                if (userData.daily == null || userData.daily + _24HOURS < timeNow) {
                    userData.daily = timeNow;
                    const bonus = userData.dailyCount == 6 ? true : false;
                    if (bonus) {
                        userData.dailyCount = 0;
                        userData.money += bonus_7_days + moneyGet;
                    } else {
                        userData.dailyCount++;
                        userData.money += moneyGet;
                    }

                    await Users.setData(senderID, userData);
                    const msg = bonus == true ?
                        getLang("daily.getWithBonus", {
                            moneyGet: addCommas(moneyGet),
                            moneyBonus: addCommas(bonus_7_days)
                        }) :
                        getLang("daily.get", {
                            moneyGet: addCommas(moneyGet)
                        });

                    reply(msg);
                } else {
                    const timeLeft = (userData.daily + _24HOURS - timeNow);
                    reply(getLang("daily.alreadyClaimed", {
                        time: msToTime(timeLeft)
                    }))
                }
            }
        } catch (e) {
            reply(getLang("any.error"));
            console.error(e);
        }

        return;
    }

    return { config, onCall };
}

function work() {
    const config = {
        name: "work",
        aliases: [],
        version: "1.0.0",
        description: getLang("work.description", null, info.name),
        usage: "",
        permissions: 2,
        cooldown: 10
    }

    const onCall = async ({ message, controllers, getLang }) => {
        const { Users } = controllers;
        const { senderID, reply } = message;
        const { min, max, workCooldown } = client.configPlugins[info.name][config.name];
        const moneyGet = random(min, max);

        try {

            const userData = await Users.getData(senderID) || {};
            const timeNow = Date.now();
            if (!isDataReady(userData)) {
                reply(getLang("economy.dataNotReady"));
            } else {
                if (userData.work == null || userData.work + workCooldown < timeNow) {
                    userData.work = timeNow;
                    userData.money += moneyGet;
                    await Users.setData(senderID, userData);
                    reply(getLang("work.get", {
                        moneyGet: addCommas(moneyGet)
                    }));
                } else {
                    const timeLeft = (userData.work + workCooldown - timeNow);
                    reply(getLang("work.inCooldown", {
                        time: msToTime(timeLeft)
                    }))
                }
            }
        } catch (e) {
            reply(getLang("any.error"));
            console.error(e);
        }

        return;
    }

    return { config, onCall };
}

function msToTime(ms) {
    let seconds = Math.floor((ms / 1000) % 60),
        minutes = Math.floor((ms / 1000 / 60) % 60),
        hours = Math.floor((ms / 1000 / 60 / 60) % 24);

    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (hours < 10) {
        hours = "0" + hours;
    }

    return `${hours}:${minutes}:${seconds}`;
}

function isDataReady(data) {
    if (Object.keys(data).length === 0) {
        return false;
    } else {
        return true;
    }
}

export const scripts = {
    commands: {
        money,
        daily,
        work
    }
}
