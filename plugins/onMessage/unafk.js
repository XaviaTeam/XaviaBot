const langData = {
    "en_US": {
        "welcomeBack": "Welcome back!"
    },
    "vi_VN": {
        "welcomeBack": "Chào mừng trở lại!"
    }
}

function checkAFK(senderData) {
    if (senderData.data && senderData.data.afk && senderData.data.afk.status) {
        return true;
    }

}

async function onCall({ message, getLang }) {
    const senderData = global.data.users.get(message.senderID) || {};
    const isAFK = checkAFK(senderData);
    if (isAFK) {
        senderData.data.afk.status = false;
        senderData.data.afk.reason = "";

        await global.controllers.Users.updateData(message.senderID, { afk: senderData.data.afk });
        return message.reply(getLang("welcomeBack"));
    }
}

export default {
    langData,
    onCall
}
