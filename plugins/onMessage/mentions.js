const langData = {
    "en_US": {
        "isAFK": "This person is busy.",
        "isAFKReason": "This person is busy. Reason: {reason}",
        "botMention": "What can I help you?"
    },
    "vi_VN": {
        "isAFK": "Người này đang bận.",
        "isAFKReason": "Người này đang bận. Lý do: {reason}",
        "botMention": "Bạn cần gì ạ?"
    }
}

function checkAFK(message, getLang) {
    const { mentions } = message;
    for (let mention in mentions) {
        let mentionData = global.data.users.get(mention) || {};
        if (mentionData.data && mentionData.data.afk && mentionData.data.afk.status) {
            message.reply(mentionData.data.afk.reason ? getLang("isAFKReason", { reason: mentionData.data.afk.reason }) : getLang("isAFK"));
        }
    }
}

function checkBotMention(message, getLang) {
    if (Object.keys(message.mentions).some(mention => mention == global.botID)) {
        message.reply(getLang("botMention"));
    }
}

function onCall({ message, getLang }) {
    if (Object.keys(message.mentions).length == 0 || message.senderID == global.botID) return;
    checkAFK(message, getLang);
    checkBotMention(message, getLang);
}

export default {
    langData,
    onCall
}
