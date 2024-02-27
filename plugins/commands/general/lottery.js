import { config as lotteryConfig } from "../../lottery.js";

const config = {
    name: "lottery",
    description: "¯_(ツ)_/¯",
    usage: "[info/bet] [number bet] [money]",
    cooldown: 5,
    permissions: [0, 1, 2],
    credits: "XaviaTeam",
};

const langData = {
    en_US: {
        anErrorHasOccurred: "An error has occurred",
        invalidNumberBet:
            "An error has occurred! The number bet is only in the range 1 - {limitNumber}",
        invalidBet: "An error has occurred! The minimum bet amount is {minBet}",
        notEnoughMoney: "You don't have enough money to bet",
        alreadyBet: "You have already bet",
        lotteryInfo:
            "💵== Lottery Info ==💵\n- Number of players: {allPlayers}\n- Total prize money: {bonus}\n- End time: {time}\n\n- Your bet number: {yourNumberBet}\n- Your bet amount: {yourBet}",
        confirmBet:
            "🍓== Confirm ==🍓\nYou bet on the number: {numberBet}\nWith the amount of money: {bet}\n\nReact 👍 to this message to confirm",
        betSuccess:
            "You have successfully bet on the number {numberBet} with the bet amount is {bet}",
    },
    vi_VN: {
        anErrorHasOccurred: "Đã có lỗi sảy ra",
        invalidNumberBet:
            "Đã có lỗi sảy ra! Số đặt cược chỉ nằm trong khoảng 1 - {limitNumber}",
        invalidBet: "Đã có lỗi sảy ra! Số tiền cược thấp nhất là {minBet}",
        notEnoughMoney: "Bạn không đủ tiền để đặt cược",
        alreadyBet: "Bạn đã đặt cược rồi",
        lotteryInfo:
            "💵== Lottery Info ==💵\n- Số người chơi: {allPlayers}\n- Tổng tiền thưởng: {bonus}\n- Thời gian kết thúc: {time}\n\n- Số bạn cược: {yourNumberBet}\n- Số tiền cược của bạn: {yourBet}",
        confirmBet:
            "🍓== Confirm ==🍓\nBạn đặt cược vào số: {numberBet}\nVới số tiền là: {bet}\n\nReact 👍 vào tin nhắn này để xác nhận",
        betSuccess:
            "Bạn đã đặt cược thành công vào số {numberBet} với mức cược là {bet}",
    },
};

/** @type {TReactCallback} */
async function confirm({ message, balance, getLang, eventData, data }) {
    try {
        const { reaction, userID } = message;
        if (reaction !== "👍") return;
        const userData = data.user;
        if (userData.data.lottery) return;

        const { numberBet, bet } = eventData;
        balance.sub(bet);

        userData.data.lottery = {
            numberBet,
            bet,
        };

        global.controllers.Users.updateData(userID, userData.data);

        message.send(getLang("betSuccess", { numberBet, bet }));
    } catch (error) {
        console.error(error);
        message.send(getLang("anErrorHasOccurred"));
    }
}

/** @type {TOnCallCommand} */
async function onCall({ message, args, balance, getLang, data }) {
    const query = args[0];
    if (!query) return message.reply(getLang("anErrorHasOccurred"));

    if (query == "info") {
        const allLotteryPlayers = Array.from(global.data.users.values()).filter(
            (e) => e.data.lottery
        );
        let bonus = 0;
        allLotteryPlayers.map((e) => (bonus += e.data.lottery.bet * 10));

        let option = {
            allPlayers: allLotteryPlayers.length,
            bonus,
            time: lotteryConfig.timeToExecute,
            yourNumberBet: 0,
            yourBet: 0,
        };

        const player = data.user;
        if (player.data.lottery) {
            option.yourNumberBet = player.data.lottery.numberBet;
            option.yourBet = player.data.lottery.bet;
        }

        return message.reply(getLang("lotteryInfo", option));
    } else if (query == "bet") {
        const numberBet = parseInt(args[1]);
        if (
            !numberBet ||
            isNaN(numberBet) ||
            numberBet <= 0 ||
            numberBet > lotteryConfig.limitNumber
        )
            return message.send(
                getLang("invalidNumberBet", {
                    limitNumber: lotteryConfig.limitNumber,
                })
            );
        const bet = balance.makeSafe(args[2]);
        const playerMoney = balance.get();
        if (bet == null || bet < lotteryConfig.minBet)
            return message.send(
                getLang("invalidBet", { minBet: lotteryConfig.minBet })
            );
        if (bet > playerMoney) return message.reply(getLang("notEnoughMoney"));

        let userData = data.user;
        if (userData.data.lottery) return message.reply(getLang("alreadyBet"));

        return message
            .reply(getLang("confirmBet", { numberBet, bet }))
            .then((_) => _.addReactEvent({ callback: confirm, numberBet, bet }))
            .catch((e) => {
                if (e.message) {
                    console.error(e.message);
                    message.reply(getLang("anErrorHasOccurred"));
                }
            });
    } else {
        return message.send(getLang("anErrorHasOccurred"));
    }
}

export { config, langData, onCall };
