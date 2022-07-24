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
        }
    }
}

export const langData = {
    "en_US": {
        "money.description": "Get, change (for moderators) money of self or other user.",
        "money.noData": "Nothing found, try again later.",
        "money.change": "{name} ({moneyChange} XC)",
        "money.self.change": "You ({moneyChange} XC)",
        "money.self.set": "Your balance is now {money} XC",
        "money.set": "{name}'s balance is now {money} XC",
        "money.isNaN": "Invalid number.",
        "money.noPermission": "You don't have permission to change money.",
        "blackjack.description": "Play blackjack with bot.",
        "blackjack.missingMoney": "You didn't bet any money.",
        "blackjack.minMoney": "Bet at least 50 XC.",
        "blackjack.notEnoughMoney": "You don't have enough money to bet.",
        "blackjack.botWin": "Bot wins!\n-{money} XC\nYour Cards: {userCards}\nBot's Cards: {botCards}",
        "blackjack.userWin": "You win!\n+{money} XC\nYour Cards: {userCards}\nBot's Cards: {botCards}",
        "blackjack.draw": "Draw!\nYour Cards: {userCards}\nBot's Cards: {botCards}",
        "blackjack.continue": "Your Cards: {userCards}\n• React 👍 to continue and get another card or 👎 to end.",
        "daily.description": "Get daily reward.",
        "daily.alreadyClaimed": "You already claimed your daily reward, come back again after {time}.",
        "daily.getWithBonus": "You got {moneyGet} XC!\nThis is your 7th day, you got a bonus of {moneyBonus} XC!",
        "daily.get": "You got {moneyGet} XC!",
        "work.description": "Work for money.",
        "work.get": "You worked hard and got {moneyGet} XC!",
        "work.inCooldown": "You can't work now, try again after {time}.",
        "any.error": "An error has occurred, try again later."
    },
    "vi_VN": {
        "money.description": "Xem, thay đổi (cho moderators) tiền của bạn hoặc người dùng khác.",
        "money.noData": "Không tìm thấy dữ liệu nào, hãy thử lại sau.",
        "money.change": "{name} ({moneyChange} XC)",
        "money.self.change": "Bạn ({moneyChange} XC)",
        "money.self.set": "Đã thay đổi số dư của bạn thành {money} XC",
        "money.set": "Đã thay đổi số dư của {name} thành {money} XC",
        "money.isNaN": "Số không hợp lệ.",
        "money.noPermission": "Bạn không có quyền thay đổi số dư.",
        "blackjack.description": "Chơi Blackjack với bot.",
        "blackjack.missingMoney": "Bạn chưa nhập số tiền cược.",
        "blackjack.minMoney": "Cược ít nhất 50 XC.",
        "blackjack.notEnoughMoney": "Bạn không có đủ tiền để cược.",
        "blackjack.botWin": "Bot thắng!\n-{money} XC\nBài của bạn: {userCards}\nBài của bot: {botCards}",
        "blackjack.userWin": "Bạn thắng!\n+{money} XC\nBài của bạn: {userCards}\nBài của bot: {botCards}",
        "blackjack.draw": "Hòa!\nBài của bạn: {userCards}\nBài của bot: {botCards}",
        "blackjack.continue": "Bài của bạn: {userCards}\n• React 👍 để tiếp tục và rút thêm hoặc 👎 để kết thúc.",
        "daily.description": "Nhận thưởng hàng ngày.",
        "daily.alreadyClaimed": "Bạn đã nhận thưởng hôm nay rồi, quay lại sau {time}.",
        "daily.getWithBonus": "Bạn đã nhận {moneyGet} XC!\nĐã nhận đủ 7 ngày nên được thưởng thêm {moneyBonus} XC!",
        "daily.get": "Bạn đã nhận {moneyGet} XC!",
        "work.description": "Làm việc kiếm tiền.",
        "work.get": "Bạn đã làm việc chăm chỉ và đã nhận {moneyGet} XC!",
        "work.inCooldown": "Bạn không thể làm việc bây giờ, hãy thử lại sau {time}.",
        "any.error": "Có lỗi xảy ra, hãy thử lại sau."
    }
}

const allCards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const allSuits = ["♣", "♦", "♥", "♠"];

async function onReact({ message, controllers, getLang, eventData }) {
    const { userID, send, messageID, reaction } = message;
    const { author, botCards, userCards, moneyBet } = eventData;
    const { Users } = controllers;
    try {
        const userData = await Users.getData(userID) || {};
        const userMoney = userData.money || 0;

        let botPoints = getPoints(botCards),
            userPoints = getPoints(userCards);

        const _bothCannotDraw = async () => {
            if (botPoints > 21) {
                const newMoney = userMoney + (moneyBet * 2);
                userData.money = newMoney;
                await Users.setData(userID, userData);
                send(getLang("blackjack.userWin", {
                    money: moneyBet,
                    userCards: userCards.join(" | "),
                    botCards: botCards.join(" | ")
                }));
            } else if (userPoints === botPoints) {
                const newMoney = userMoney + moneyBet;
                userData.money = newMoney;
                await Users.setData(userID, userData);
                send(getLang("blackjack.draw", {
                    userCards: userCards.join(" | "),
                    botCards: botCards.join(" | ")
                }));
            } else {
                if (userCards.length < 5 && botCards.length < 5) {
                    if (userPoints > botPoints) {
                        const newMoney = userMoney + (moneyBet * 2);
                        userData.money = newMoney;
                        await Users.setData(userID, userData);
                        send(getLang("blackjack.userWin", {
                            money: moneyBet,
                            userCards: userCards.join(" | "),
                            botCards: botCards.join(" | ")
                        }));
                    } else {
                        send(getLang("blackjack.botWin", {
                            money: moneyBet,
                            userCards: userCards.join(" | "),
                            botCards: botCards.join(" | ")
                        }));
                    }
                } else {
                    if (userCards.length == 5 && botCards.length == 5) {
                        if (userPoints > botPoints) {
                            const newMoney = userMoney + (moneyBet * 2);
                            userData.money = newMoney;
                            await Users.setData(userID, userData);
                            send(getLang("blackjack.userWin", {
                                money: moneyBet,
                                userCards: userCards.join(" | "),
                                botCards: botCards.join(" | ")
                            }));
                        } else {
                            send(getLang("blackjack.botWin", {
                                money: moneyBet,
                                userCards: userCards.join(" | "),
                                botCards: botCards.join(" | ")
                            }));
                        }
                    } else {
                        if (userCards.length == 5) {
                            const newMoney = userMoney + (moneyBet * 2);
                            userData.money = newMoney;
                            await Users.setData(userID, userData);
                            send(getLang("blackjack.userWin", {
                                money: moneyBet,
                                userCards: userCards.join(" | "),
                                botCards: botCards.join(" | ")
                            }));
                        } else {
                            send(getLang("blackjack.botWin", {
                                money: moneyBet,
                                userCards: userCards.join(" | "),
                                botCards: botCards.join(" | ")
                            }));
                        }
                    }
                }
            }
        }
        const _botDrawTillEnd = () => {
            let botContinue = true;
            while (botCards.length < 5 && botPoints < 18 && botContinue) {
                if (botPoints >= 16) {
                    if (Math.random() > 0.6) {
                        botContinue = false;
                    }
                }
                if (botContinue) {
                    const botCard = allCards[Math.floor(Math.random() * allCards.length)] + allSuits[Math.floor(Math.random() * allSuits.length)];
                    if (
                        !userCards.some(e => e === botCard) &&
                        !botCards.some(e => e === botCard)
                    ) {
                        botCards.push(botCard);
                        botPoints = getPoints(botCards);
                    }
                }
            }
        }

        if (userID === author) {
            if (reaction === "👍") {
                client.handleMaps.reactions.delete(messageID);
                const oldCardsLength = userCards.length;
                while (userCards.length === oldCardsLength) {
                    const userCard = allCards[Math.floor(Math.random() * allCards.length)] + allSuits[Math.floor(Math.random() * allSuits.length)];
                    if (
                        !userCards.some(e => e === userCard) &&
                        !botCards.some(e => e === userCard)
                    ) {
                        userCards.push(userCard);
                    }
                }

                botPoints = getPoints(botCards);
                userPoints = getPoints(userCards);

                if (botPoints < 18) {
                    let botContinue = true;
                    if (botPoints >= 16) {
                        if (Math.random() > 0.6) {
                            botContinue = false;
                        }
                    }

                    if (botContinue) {
                        const oldBotCardsLength = botCards.length;
                        while (botCards.length === oldBotCardsLength) {
                            const botCard = allCards[Math.floor(Math.random() * allCards.length)] + allSuits[Math.floor(Math.random() * allSuits.length)];
                            if (
                                !userCards.some(e => e === botCard) &&
                                !botCards.some(e => e === botCard)
                            ) {
                                botCards.push(botCard);
                                botPoints = getPoints(botCards);
                            }
                        }
                    }
                }

                if (userPoints > 21) {
                    if (botPoints > 21) {
                        const newMoney = userMoney + moneyBet;
                        userData.money = newMoney;
                        await Users.setData(userID, userData);
                        send(getLang("blackjack.draw", {
                            userCards: userCards.join(" | "),
                            botCards: botCards.join(" | ")
                        }));
                    } else {
                        send(getLang("blackjack.botWin", {
                            money: moneyBet,
                            userCards: userCards.join(" | "),
                            botCards: botCards.join(" | ")
                        }));
                    }
                } else {
                    if (botPoints > 21) {
                        const newMoney = userMoney + (moneyBet * 2);
                        userData.money = newMoney;
                        await Users.setData(userID, userData);
                        send(getLang("blackjack.userWin", {
                            money: moneyBet,
                            userCards: userCards.join(" | "),
                            botCards: botCards.join(" | ")
                        }));
                    } else {
                        if (botPoints >= 18 && userPoints >= 18) {
                            _bothCannotDraw();
                        } else {
                            if (userPoints >= 18) {
                                _botDrawTillEnd();
                                _bothCannotDraw();
                            } else {
                                send(getLang("blackjack.continue", {
                                    userCards: userCards.join(" | "),
                                    botCards: botCards.join(" | ")
                                }))
                                    .then(data => data.addReactEvent({ botCards, userCards, moneyBet }))
                                    .catch(err => {
                                        send(getLang("any.error"));
                                        console.error(err);
                                    });
                            }
                        }
                    }
                }
            } else if (reaction === "👎") {
                client.handleMaps.reactions.delete(messageID);
                _botDrawTillEnd();
                _bothCannotDraw();
            }
        }
    } catch (e) {
        send(getLang("any.error"));
        console.error(e);
    }

    return;
}


function money() {
    const config = {
        name: "money",
        aliases: ["money", "balance", "bal", "wallet"],
        description: getLang("money.description", null, info.name),
        usage: "[@tag]/[inc/dec/set] [@tag] [amount]",
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
                    const targetID = Object.keys(mentions).length == 0 ? senderID : Object.keys(mentions)[0];
                    const userData = await Users.getData(targetID) || {};
                    const userMoney = userData.money || 0;

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
                } else {
                    reply(getLang("money.noPermission"));
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

function blackjack() {
    const config = {
        name: "blackjack",
        aliases: ["blackjack", "bj"],
        description: getLang("blackjack.description", null, info.name),
        usage: "[money]",
        permissions: 2,
        cooldown: 10
    }

    const onCall = async ({ message, args, controllers, getLang }) => {
        const { Users } = controllers;
        const { senderID, reply } = message;
        try {
            const moneyBet = args[0] ? parseInt(args[0]) : null;
            const userData = await Users.getData(senderID) || {};
            const userMoney = userData.money || 0;

            if (moneyBet == null) {
                reply(getLang("blackjack.missingMoney"));
            } else if (moneyBet < 50) {
                reply(getLang("blackjack.minMoney"));
            } else if (userMoney < moneyBet) {
                reply(getLang("blackjack.notEnoughMoney"));
            } else {
                userData.money -= moneyBet;
                await Users.setData(senderID, userData);

                const botCards = [], userCards = [];
                for (let i = 0; i < 2; i++) {
                    const botCard = allCards[Math.floor(Math.random() * allCards.length)];
                    const botSuit = allSuits[Math.floor(Math.random() * allSuits.length)];
                    botCards[i] = `${botCard}${botSuit}`;
                    if (botCards[i] == botCards[i - 1]) {
                        i--;
                    }
                }

                for (let i = 0; i < 2; i++) {
                    const userCard = allCards[Math.floor(Math.random() * allCards.length)];
                    const userSuit = allSuits[Math.floor(Math.random() * allSuits.length)];
                    userCards[i] = `${userCard}${userSuit}`;
                    if (userCards[i] == userCards[i - 1] || botCards.some(e => e == userCards[i])) {
                        i--;
                    }
                }

                let botLevel = 0, userLevel = 0;
                if (botCards[0].startsWith("A") && botCards[1].startsWith("A")) {
                    botLevel = 3;
                }
                if (botCards[0].startsWith("A") && ["J", "Q", "K"].some(e => botCards[1].startsWith(e))) {
                    botLevel = 2;
                }
                if (botCards[1].startsWith("A") && ["J", "Q", "K"].some(e => botCards[0].startsWith(e))) {
                    botLevel = 2;
                }

                if (userCards[0].startsWith("A") && userCards[1].startsWith("A")) {
                    userLevel = 3;
                }
                if (userCards[0].startsWith("A") && ["J", "Q", "K"].some(e => userCards[1].startsWith(e))) {
                    userLevel = 2;
                }
                if (userCards[1].startsWith("A") && ["J", "Q", "K"].some(e => userCards[0].startsWith(e))) {
                    userLevel = 2;
                }

                if (botLevel > userLevel) {
                    reply(getLang("blackjack.botWin", { money: addCommas(moneyBet), botCards: botCards.join(" | "), userCards: userCards.join(" | ") }));
                } else if (botLevel < userLevel) {
                    const newMoney = userMoney + (moneyBet * 3);
                    userData.money = newMoney;
                    await Users.setData(senderID, userData);
                    reply(getLang("blackjack.userWin", { money: addCommas(moneyBet * 2), botCards: botCards.join(" | "), userCards: userCards.join(" | ") }));
                } else {
                    let botPoints = getPoints(botCards),
                        userPoints = getPoints(userCards);

                    if (botPoints >= 18 && userPoints >= 18) {
                        if (botPoints > userPoints) {
                            reply(getLang("blackjack.botWin", { money: addCommas(moneyBet), botCards: botCards.join(" | "), userCards: userCards.join(" | ") }));
                        } else if (botPoints < userPoints) {
                            const newMoney = userMoney + (moneyBet * 2);
                            userData.money = newMoney;
                            await Users.setData(senderID, userData);
                            reply(getLang("blackjack.userWin", { money: addCommas(moneyBet), botCards: botCards.join(" | "), userCards: userCards.join(" | ") }));
                        } else {
                            const newMoney = userMoney + moneyBet;
                            userData.money = newMoney;
                            await Users.setData(senderID, userData);
                            reply(getLang("blackjack.draw", {
                                userCards: userCards.join(" | "),
                                botCards: botCards.join(" | ")
                            }));
                        }
                    } else if (userPoints >= 18) {
                        let botContinue = true;
                        while (botCards.length < 5 && botPoints < 18 && botContinue == true) {
                            if (botPoints >= 16) {
                                if (Math.random() > 0.6) {
                                    botContinue = false;
                                }
                            }
                            if (botContinue == true) {
                                const botCard = allCards[Math.floor(Math.random() * allCards.length)];
                                const botSuit = allSuits[Math.floor(Math.random() * allSuits.length)];
                                const botCardNew = `${botCard}${botSuit}`;

                                if (
                                    !userCards.some(e => e == botCardNew) &&
                                    !botCards.some(e => e == botCardNew)
                                ) {
                                    botCards.push(botCardNew);
                                    botPoints = getPoints(botCards);
                                }
                            }
                        }

                        if (botPoints > userPoints) {
                            if (botPoints <= 21) {
                                reply(getLang("blackjack.botWin", { money: addCommas(moneyBet), botCards: botCards.join(" | "), userCards: userCards.join(" | ") }));
                            } else {
                                const newMoney = userMoney + (moneyBet * 2);
                                userData.money = newMoney;
                                await Users.setData(senderID, userData);
                                reply(getLang("blackjack.userWin", { money: addCommas(moneyBet), botCards: botCards.join(" | "), userCards: userCards.join(" | ") }));
                            }
                        } else if (botPoints < userPoints) {
                            if (botPoints >= 16 && botCards.length == 5) {
                                reply(getLang("blackjack.botWin", { money: addCommas(moneyBet), botCards: botCards.join(" | "), userCards: userCards.join(" | ") }));
                            } else {
                                const newMoney = userMoney + (moneyBet * 2);
                                userData.money = newMoney;
                                await Users.setData(senderID, userData);
                                reply(getLang("blackjack.userWin", { money: addCommas(moneyBet), botCards: botCards.join(" | "), userCards: userCards.join(" | ") }));
                            }
                        } else {
                            const newMoney = userMoney + moneyBet;
                            userData.money = newMoney;
                            await Users.setData(senderID, userData);
                            reply(getLang("blackjack.draw", {
                                userCards: userCards.join(" | "),
                                botCards: botCards.join(" | ")
                            }));
                        }
                    } else {
                        reply(getLang("blackjack.continue", { userCards: userCards.join(" | ") }))
                            .then(data => data.addReactEvent({
                                botCards: botCards,
                                userCards: userCards,
                                moneyBet: moneyBet
                            }))
                            .catch(err => {
                                reply(getLang("any.error"));
                                console.error(err);
                            });
                    }
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

function getPoints(cards) {
    let tmp = [...cards];
    let aces = [];
    for (let i = 0; i < tmp.length; i++) {
        if (tmp[i].startsWith("A")) {
            aces.push(tmp[i]);
            tmp.splice(i, 1);
        }
    }
    tmp = tmp.concat(aces);
    let points = 0;
    for (let i = 0; i < tmp.length; i++) {
        if (tmp[i].startsWith("A")) {
            if (tmp.length == 2) {
                points += 11;
            } else if (tmp.length == 3) {
                points += 10;
                if (points > 21) points -= 9;
            } else {
                points += 1;
            }
        } else if (["J", "Q", "K"].some(e => tmp[i].startsWith(e))) {
            points += 10;
        } else {
            points += parseInt(tmp[i].slice(0, -1));
        }
    }
    return points;
}


function daily() {
    const config = {
        name: "daily",
        aliases: [],
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


export const scripts = {
    commands: {
        money,
        blackjack,
        daily,
        work
    },
    onReact
}
