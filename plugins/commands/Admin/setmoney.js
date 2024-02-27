const config = {
    name: "setmoney",
    aliases: ["setbalance", "setbal"],
    permissions: [2],
    description: "Set money of a user",
    usage: "<reply/tag/me> <amount>",
    credits: "XaviaTeam",
};

const langData = {
    en_US: {
        "setmoney.noTarget": "Reply to a message or tag someone, or use 'me' to set your own money",
        "setmoney.invalidAmount": "Invalid amount",
        "setmoney.userNoData": "User not found/not ready",
        "setmoney.onlyOneMention": "You can only mention one person",
        "setmoney.success": "Done",
        "setmoney.failed": "Failed",
    },
    vi_VN: {
        "setmoney.noTarget":
            "Trả lời tin nhắn của người khác hoặc tag một người, hoặc dùng 'me' để set tiền của bản thân",
        "setmoney.invalidAmount": "Số tiền không hợp lệ",
        "setmoney.userNoData": "Người dùng không tồn tại/chưa sẵn sàng",
        "setmoney.onlyOneMention": "Bạn chỉ có thể tag một người",
        "setmoney.success": "Thành công",
        "setmoney.failed": "Thất bại",
    },
    ar_SY: {
        "setmoney.noTarget":
            "قم بالرد على رسالة أو وضع علامة على شخص ما ، أو استخدم 'me' لتعيين أموالك الخاصة",
        "setmoney.invalidAmount": "مبلغ غير صحيح",
        "setmoney.userNoData": "المستخدم غير موجود / غير جاهز",
        "setmoney.onlyOneMention": "يمكنك فقط ذكر شخص واحد",
        "setmoney.success": "نجح",
        "setmoney.failed": "باءت بالفشل",
    },
};

/** @type {TOnCallCommand} */
async function onCall({ message, args, balance, getLang }) {
    const { type, mentions } = message;
    if (type !== "message_reply" && Object.keys(mentions).length === 0 && args[0] !== "me")
        return message.reply(getLang("setmoney.noTarget"));

    try {
        if (type == "message_reply") {
            const { senderID: TSenderID } = message.messageReply;

            const amount = balance.makeSafe(args[0]);
            if (amount == null) return message.reply(getLang("setmoney.invalidAmount"));

            const userBalance = balance.from(TSenderID);
            if (userBalance == null) return message.reply(getLang("setmoney.userNoData"));

            userBalance.set(amount);
        } else if (args[0] === "me") {
            const amount = balance.makeSafe(args[1]);
            if (amount == null) return message.reply(getLang("setmoney.invalidAmount"));

            const userBalance = balance.from(message.senderID);
            if (userBalance == null) return message.reply(getLang("setmoney.userNoData"));

            userBalance.set(amount);
        } else {
            if (Object.keys(mentions).length > 1)
                return message.reply(getLang("setmoney.onlyOneMention"));
            const TSenderID = Object.keys(mentions)[0];
            const TName = mentions[TSenderID];
            const TNameLength = TName.split(" ").length;

            const amount = balance.makeSafe(args[TNameLength]);
            if (amount == null) return message.reply(getLang("setmoney.invalidAmount"));

            const userBalance = balance.from(TSenderID);
            if (userBalance == null) return message.reply(getLang("setmoney.userNoData"));

            userBalance.set(amount);
        }

        message.reply(getLang("setmoney.success"));
    } catch (err) {
        console.error(err);
        message.reply(getLang("setmoney.failed"));
    }
}

export default {
    config,
    langData,
    onCall,
};
