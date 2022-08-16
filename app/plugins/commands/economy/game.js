export const info = {
    name: "Economy Games",
    about: "Economy system Games"
}

export const langData = {
    "en_US": {
        "blackjack.description": "Play blackjack with bot.",
        "blackjack.missingMoney": "You didn't bet any money.",
        "blackjack.minMoney": "Bet at least 50 XC.",
        "blackjack.notEnoughMoney": "You don't have enough money to bet.",
        "blackjack.botWin": "Bot wins!\n-{money} XC\nYour Cards: {userCards}\nBot's Cards: {botCards}",
        "blackjack.userWin": "You win!\n+{money} XC\nYour Cards: {userCards}\nBot's Cards: {botCards}",
        "blackjack.draw": "Draw!\nYour Cards: {userCards}\nBot's Cards: {botCards}",
        "blackjack.continue": "Your Cards: {userCards}\n• React 👍 to continue and get another card or 👎 to end.",
        "sicbo.description": "Play sicbo with bot.",
        "sicbo.usage": "[big/small] [money]",
        "sicbo.missingArgs": "You didn't enter enough arguments.",
        "sicbo.invalidChoice": "Invalid choice, available choices:\n{small}\n{big}",
        "sicbo.missingMoney": "You didn't bet any money.",
        "sicbo.minMoney": "Bet at least 50 XC.",
        "sicbo.notEnoughMoney": "You don't have enough money to bet.",
        "sicbo.win": "You win! (+{money} XC)\nDices: {dice_one}, {dice_two}, {dice_three} ({result})",
        "sicbo.lose": "You lose! (-{money} XC)\nDices: {dice_one}, {dice_two}, {dice_three} ({result})",
        "sicbo.result_1": "small",
        "sicbo.result_2": "big",
        "sicbo.result_0": "triples",
        "any.error": "An error has occurred, try again later."
    },
    "vi_VN": {
        "blackjack.description": "Chơi Blackjack với bot.",
        "blackjack.missingMoney": "Bạn chưa nhập số tiền cược.",
        "blackjack.minMoney": "Cược ít nhất 50 XC.",
        "blackjack.notEnoughMoney": "Bạn không có đủ tiền để cược.",
        "blackjack.botWin": "Bot thắng!\n-{money} XC\nBài của bạn: {userCards}\nBài của bot: {botCards}",
        "blackjack.userWin": "Bạn thắng!\n+{money} XC\nBài của bạn: {userCards}\nBài của bot: {botCards}",
        "blackjack.draw": "Hòa!\nBài của bạn: {userCards}\nBài của bot: {botCards}",
        "blackjack.continue": "Bài của bạn: {userCards}\n• React 👍 để tiếp tục và rút thêm hoặc 👎 để kết thúc.",
        "sicbo.description": "Chơi tài xỉu với bot.",
        "sicbo.usage": "[tài/xỉu] [money]",
        "sicbo.missingArgs": "Bạn chưa nhập đủ tham số.",
        "sicbo.invalidChoice": "Lựa chọn không hợp lệ, các lựa chọn hợp lệ:\n{small}\n{big}",
        "sicbo.missingMoney": "Bạn chưa nhập số tiền cược.",
        "sicbo.minMoney": "Cược ít nhất 50 XC.",
        "sicbo.notEnoughMoney": "Bạn không có đủ tiền để cược.",
        "sicbo.win": "Bạn thắng! (+{money} XC)\nSố xí ngầu: {dice_one}, {dice_two}, {dice_three} ({result})",
        "sicbo.lose": "Bạn thua! (-{money} XC)\nSố xí ngầu: {dice_one}, {dice_two}, {dice_three} ({result})",
        "sicbo.result_1": "tài",
        "sicbo.result_2": "xỉu",
        "sicbo.result_0": "bộ ba",
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

function blackjack() {
    const config = {
        name: "blackjack",
        aliases: ["blackjack", "bj"],
        version: "1.0.1",
        description: getLang("blackjack.description", null, info.name),
        usage: "[money]",
        permissions: 2,
        cooldown: 5
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
                    userData.money += moneyBet * 3;
                    await Users.setData(senderID, userData);
                    reply(getLang("blackjack.userWin", { money: addCommas(moneyBet * 2), botCards: botCards.join(" | "), userCards: userCards.join(" | ") }));
                } else {
                    let botPoints = getPoints(botCards),
                        userPoints = getPoints(userCards);

                    if (botPoints >= 18 && userPoints >= 18) {
                        if (botPoints > userPoints) {
                            reply(getLang("blackjack.botWin", { money: addCommas(moneyBet), botCards: botCards.join(" | "), userCards: userCards.join(" | ") }));
                        } else if (botPoints < userPoints) {
                            userData.money += moneyBet * 2;
                            await Users.setData(senderID, userData);
                            reply(getLang("blackjack.userWin", { money: addCommas(moneyBet), botCards: botCards.join(" | "), userCards: userCards.join(" | ") }));
                        } else {
                            userData.money += moneyBet;
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
                                userData.money += moneyBet * 2;
                                await Users.setData(senderID, userData);
                                reply(getLang("blackjack.userWin", { money: addCommas(moneyBet), botCards: botCards.join(" | "), userCards: userCards.join(" | ") }));
                            }
                        } else if (botPoints < userPoints) {
                            if (botPoints >= 16 && botCards.length == 5) {
                                reply(getLang("blackjack.botWin", { money: addCommas(moneyBet), botCards: botCards.join(" | "), userCards: userCards.join(" | ") }));
                            } else {
                                userData.money += moneyBet * 2;
                                await Users.setData(senderID, userData);
                                reply(getLang("blackjack.userWin", { money: addCommas(moneyBet), botCards: botCards.join(" | "), userCards: userCards.join(" | ") }));
                            }
                        } else {
                            userData.money += moneyBet;
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

const small = ["small", "s", "xỉu", "xiu", "x"];
const big = ["big", "b", "tài", "tai", "t"];

function sicbo() {
    const config = {
        name: "sicbo",
        aliases: ["taixiu", "tx"],
        version: "1.0.0",
        description: getLang("sicbo.description", null, info.name),
        usage: getLang("sicbo.usage", null, info.name),
        permissions: 2,
        cooldown: 5
    }

    const onCall = async ({ message, args, controllers, getLang }) => {
        const { reply, senderID } = message;
        const { Users } = controllers;
        if (args.length < 2) {
            reply(getLang("sicbo.missingArgs"));
        } else {
            try {
                const choice = args[0]?.toLowerCase();
                const choice_to_num = small.some(e => choice.includes(e)) ? 1 : big.some(e => choice.includes(e)) ? 2 : null;

                if (choice_to_num == null) {
                    reply(getLang("sicbo.invalidChoice", { small: small.join(", "), big: big.join(", ") }));
                }

                const moneyBet = args[1] ? parseInt(args[1]) : null;
                const userData = await Users.getData(senderID) || {};
                const userMoney = userData.money || 0;
    
                if (moneyBet == null) {
                    reply(getLang("sicbo.missingMoney"));
                } else if (moneyBet < 50) {
                    reply(getLang("sicbo.minMoney"));
                } else if (userMoney < moneyBet) {
                    reply(getLang("sicbo.notEnoughMoney"));
                } else {
                    userData.money -= moneyBet;
                    let dice_one = Math.ceil(Math.random() * 6);
                    let dice_two = Math.ceil(Math.random() * 6);
                    let dice_three = Math.ceil(Math.random() * 6);
                    
                    const result = dice_one == dice_two && dice_two == dice_three ? 0 :
                                    dice_one + dice_two + dice_three <= 10 ? 1 : 2;
                    const resultString = getLang(`sicbo.result_${result}`);
                    if (result == choice_to_num) {
                        userData.money += moneyBet * 2;
                        await Users.setData(senderID, userData);
                        reply(getLang("sicbo.win", { money: addCommas(moneyBet), dice_one: dice_one, dice_two: dice_two, dice_three: dice_three, result: resultString }));
                    } else {
                        await Users.setData(senderID, userData);
                        reply(getLang("sicbo.lose", { money: addCommas(moneyBet), dice_one: dice_one, dice_two: dice_two, dice_three: dice_three, result: resultString }));
                    }
                }
            } catch (e) {
                console.error(e);
                reply(getLang("any.error"));
            }
        }

        return;
    }

    return { config, onCall };
}

export const scripts = {
    commands: {
        blackjack,
        sicbo
    },
    onReact
}
