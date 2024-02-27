import moment from "moment-timezone";
import { Balance } from "../core/handlers/balance.js";

const config = {
    limitNumber: 1000,
    timeToExecute: "8:44:00",
    minBet: 500
}

async function findTheWinners() {
    let defaultBonus = 10000;

    const randomNumber = Math.ceil(Math.random() * config.limitNumber);
    const allLotteryPlayers = Array.from(global.data.users.values()).filter(e => e.data.lottery && e.data.lottery.bet);
    const playersWinBet = allLotteryPlayers.filter(e => e.data.lottery.numberBet == randomNumber).map(e => { return e.userID })
    const playersLoseBet = allLotteryPlayers.filter(e => !playersWinBet.includes(e.userID));

    for (let player of allLotteryPlayers) {
        defaultBonus += (player.data.lottery.bet * 10);
    }

    for (let player of playersWinBet) {
        global.api.sendMessage({
            body: `💵== Lottery ==💵\nCongrats you won the lottery with lag bonus: ${defaultBonus}`
        }, player)

        const userBalance = Balance.from(player);
        if (userBalance == null) continue;

        userBalance.add(Math.ceil(defaultBonus / playersWinBet.length))
    }

    for(let player of playersLoseBet) {
        global.api.sendMessage({
            body: `💵== Lottery ==💵\nYou lose your bet`
        }, player.userID)
    }

    allLotteryPlayers.map(e => {
        delete e.data.lottery;
        return global.controllers.Users.updateData(e.userID, e.data);
    });
}

async function execute() {
    const timezone = global.config?.timezone || "Asia/Ho_Chi_Minh";
    if (!timezone) return;

    const tz = moment.tz(timezone).format("MM/DD/YYYY HH:mm:ss")
    const time = [tz.split(" ")[0], config.timeToExecute].toString();

    let currentTime = Date.parse(tz);
    let executionTime = Date.parse(time);

    if (executionTime - currentTime <= 0) executionTime += (1000 * 60 * 60 * 24);

    const timeOut = executionTime - currentTime;

    setTimeout(async () => {
        findTheWinners();
    }, timeOut)
}

export {
    execute,
    config
}
