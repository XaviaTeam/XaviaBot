const config = {
    name: "send",
    aliases: ["pay"],
    credits: "XaviaTeam",
    description: "Send money to other user",
    usage: "mention> <amount>",
    cooldown: 5,
    extra: {
        minAmount: 100,
        fee: 0.05
    }
}

const langData = {
    "en_US": {
        "missingMention": "You need to mention someone to send money to them",
        "invalidAmount": "Invalid amount",
        "lowerThanMin": "Minimum amount is {minAmount} XC",
        "notEnoughMoney": "You don't have enough money, you need {amount} XC more",
        "sendSuccessFee": "You have sent {amount} XC to {name} (fee: {fee} XC)",
        "error": "An error occurred, please try again later"
    },
    "vi_VN": {
        "missingMention": "Bạn cần phải tag người dùng để gửi tiền cho họ",
        "invalidAmount": "Số tiền không hợp lệ",
        "lowerThanMin": "Số tiền tối thiểu là {minAmount} XC",
        "notEnoughMoney": "Bạn không đủ tiền, bạn cần thêm {amount} XC",
        "sendSuccessFee": "Bạn đã gửi {amount} XC cho {name} (thuế: {fee} XC)",
        "error": "Đã xảy ra lỗi, vui lòng thử lại sau"
    },
    "ar_SY": {
        "missingMention": "تحتاج إلى ذكر شخص ما لإرسال الأموال إليه",
        "invalidAmount": "مبلغ غير صحيح",
        "lowerThanMin": "الحد الأدنى للمبلغ هو {minAmount} XC",
        "notEnoughMoney": "ليس لديك ما يكفي من المال ، فأنت بحاجة إلى المزيد {amount} XC",
        "sendSuccessFee": "لقد ارسلت {amount} XC الى {name} (مصاريف: {fee} XC)",
        "error": "لقد حدث خطأ، رجاء أعد المحاولة لاحقا"
    }
}

async function onCall({ message, args, extra, getLang }) {
    const { mentions, senderID, reply } = message;
    if (Object.keys(mentions).length == 0) return reply(getLang("missingMention"));

    try {
        const targetID = Object.keys(mentions)[0];
        const targetNameLength = mentions[targetID].length;

        let amount = args.join(" ").slice(targetNameLength).trim().split(" ").shift();
        if (isNaN(Number(amount))) return reply(getLang("invalidAmount"));
        amount = BigInt(amount);
        if (amount < BigInt(extra.minAmount)) return reply(getLang("lowerThanMin", { minAmount: extra.minAmount }));

        const { Users } = global.controllers;

        const senderMoney = await Users.getMoney(senderID);
        const fee = BigInt(amount * BigInt(parseInt(extra.fee * 100)) / 100n);
        const total = amount + fee;
        if (senderMoney == null || BigInt(senderMoney) < total) return reply(getLang("notEnoughMoney", { amount: addCommas(total - BigInt(senderMoney)) }));

        const targetMoney = await Users.getMoney(targetID);
        if (targetMoney == null) return reply(getLang("error"));

        await Users.decreaseMoney(senderID, total);
        await Users.increaseMoney(targetID, amount);

        return reply(getLang("sendSuccessFee", { amount: addCommas(amount), name: mentions[targetID].replace(/@/g, ""), fee: addCommas(fee) }));
    } catch (e) {
        console.log(e);
        return reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}
