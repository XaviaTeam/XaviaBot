const config = {
    name: "send",
    aliases: ["pay"],
    credits: "XaviaTeam",
    description: "Send money to other user",
    usage: "<mention> <amount>",
    cooldown: 5,
    extra: {
        minAmount: 100,
        fee: 0.05,
    },
};

const langData = {
    en_US: {
        missingMention: "You need to mention someone to send money to them",
        invalidAmount: "Invalid amount",
        lowerThanMin: "Minimum amount is {minAmount} XC",
        notEnoughMoney: "You don't have enough money, you need {amount} XC more",
        sendSuccessFee: "You have sent {amount} XC to {name} (fee: {fee} XC)",
        error: "An error occurred, please try again later",
    },
    vi_VN: {
        missingMention: "Bạn cần phải tag người dùng để gửi tiền cho họ",
        invalidAmount: "Số tiền không hợp lệ",
        lowerThanMin: "Số tiền tối thiểu là {minAmount} XC",
        notEnoughMoney: "Bạn không đủ tiền, bạn cần thêm {amount} XC",
        sendSuccessFee: "Bạn đã gửi {amount} XC cho {name} (thuế: {fee} XC)",
        error: "Đã xảy ra lỗi, vui lòng thử lại sau",
    },
    ar_SY: {
        missingMention: "تحتاج إلى ذكر شخص ما لإرسال الأموال إليه",
        invalidAmount: "مبلغ غير صحيح",
        lowerThanMin: "الحد الأدنى للمبلغ هو {minAmount} XC",
        notEnoughMoney: "ليس لديك ما يكفي من المال ، فأنت بحاجة إلى المزيد {amount} XC",
        sendSuccessFee: "لقد ارسلت {amount} XC الى {name} (مصاريف: {fee} XC)",
        error: "لقد حدث خطأ، رجاء أعد المحاولة لاحقا",
    },
};

/** @type {TOnCallCommand} */
async function onCall({ message, args, balance, extra, getLang }) {
    const { mentions, reply } = message;
    const { addCommas } = global.utils;
    
    if (Object.keys(mentions).length == 0) return reply(getLang("missingMention"));

    try {
        const feePercent = balance.make(extra.fee * 100);
        const targetID = Object.keys(mentions)[0];
        const targetNameLength = mentions[targetID].length;

        const amount = balance.makeSafe(
            args.join(" ").slice(targetNameLength).trim().split(" ").shift()
        );

        if (amount == null) return reply(getLang("invalidAmount"));

        if (amount < balance.make(extra.minAmount))
            return reply(getLang("lowerThanMin", { minAmount: extra.minAmount }));

        const senderMoney = balance.get();
        const fee = (amount * feePercent) / 100n;
        const total = amount + fee;

        if (senderMoney < total)
            return reply(
                getLang("notEnoughMoney", {
                    amount: addCommas(total - senderMoney),
                })
            );

        const targetBalance = balance.from(targetID);
        if (targetBalance == null) return reply(getLang("error"));

        balance.sub(total);
        targetBalance.add(amount);

        return reply(
            getLang("sendSuccessFee", {
                amount: addCommas(amount),
                name: mentions[targetID].replace(/@/g, ""),
                fee: addCommas(fee),
            })
        );
    } catch (e) {
        console.error(e);
        return reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall,
};
