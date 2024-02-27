const _6HOURS = 6 * 60 * 60 * 1000;
const _2HOURS = 2 * 60 * 60 * 1000;
const _3HOURS = 3 * 60 * 60 * 1000;
const _1HOURS = 1 * 60 * 60 * 1000;
const _30MINUTES = 30 * 60 * 1000;

const config = {
    name: "work",
    aliases: ["wk"],
    description: "Work to earn money",
    credits: "XaviaTeam",
    extra: {
        min: 200,
        max: 1000,
        delay: [_30MINUTES, _1HOURS, _3HOURS, _2HOURS, _6HOURS],
    },
};

const langData = {
    en_US: {
        "work.selfNoData": "Your data is not ready",
        "work.alreadyWorked": "You have already worked, you can work again in {time}",
        "work.successfullyWorked": "You have worked and earned {amount}XC",
        "work.failed": "Failed",
    },
    vi_VN: {
        "work.selfNoData": "Dữ liệu của bạn chưa sẵn sàng",
        "work.alreadyWorked": "Bạn đã làm việc, bạn có thể làm việc lại sau {time}",
        "work.successfullyWorked": "Bạn đã làm việc và kiếm được {amount}XC",
        "work.failed": "Thất bại",
    },
    ar_SY: {
        "work.selfNoData": "البيانات الخاصة بك ليست جاهزة",
        "work.alreadyWorked": "لقد عملت ، يمكنك العمل مرة أخرى لاحقًا {time}",
        "work.successfullyWorked": "لقد عملت وكسبت {amount}XC",
        "work.failed": "باءت بالفشل",
    },
};

/** @type {TOnCallCommand} */
async function onCall({ message, balance, extra, getLang }) {
    const { Users } = global.controllers;
    const { min, max, delay } = extra;
    try {
        const userData = await Users.getData(message.senderID);
        if (!userData) return message.reply(getLang("work.selfNoData"));

        if (!userData.hasOwnProperty("work") || typeof userData.work !== "object")
            userData.work = { lastWorked: 0, delay: 0 };
        if (!userData.work.hasOwnProperty("lastWorked")) userData.work.lastWorked = 0;
        if (!userData.work.hasOwnProperty("delay")) userData.work.delay = 0;

        if (Date.now() - userData.work.lastWorked < userData.work.delay)
            return message.reply(
                getLang("work.alreadyWorked", {
                    time: global.utils.msToHMS(
                        userData.work.delay - (Date.now() - userData.work.lastWorked)
                    ),
                })
            );

        userData.work.lastWorked = Date.now();
        userData.work.delay = delay[global.utils.random(0, delay.length - 1)];
        await Users.updateData(message.senderID, { work: userData.work });

        const amount = global.utils.random(min, max);
        balance.add(amount);

        message.reply(getLang("work.successfullyWorked", { amount: global.utils.addCommas(amount) }));
    } catch (error) {
        console.error(error);
        message.reply(getLang("work.failed"));
    }
}

export default {
    config,
    langData,
    onCall,
};
