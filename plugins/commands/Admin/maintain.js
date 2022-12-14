const config = {
    name: "maintain",
    description: "on/off maintain mode",
    usage: "[on/off]",
    cooldown: 3,
    permissions: [2],
    credits: "XaviaTeam",
    isAbsolute: true
}

const langData = {
    "vi_VN": {
        "alreadyOn": "Bot đã ở trong chế độ bảo trì",
        "on": "Đã bật chế độ bảo trì",
        "alreadyOff": "Bot đã ở ngoài chế độ bảo trì",
        "off": "Đã tắt chế độ bảo trì"
    },
    "en_US": {
        "alreadyOn": "Bot is already in maintain mode",
        "on": "Turned on maintain mode",
        "alreadyOff": "Bot is already out of maintain mode",
        "off": "Turned off maintain mode"
    },
    "ar_SY": {
        "alreadyOn": "الروبوت في وضع الصيانة بالفعل",
        "on": "تم تشغيل وضع الصيانة",
        "alreadyOff": "البوت خارج وضع الصيانة بالفعل",
        "off": "تم إيقاف تشغيل وضع الصيانة"
    }
}

async function onCall({ message, args, getLang }) {
    let input = args[0]?.toLowerCase() == "on" ? true : args[0]?.toLowerCase() == "off" ? false : null;

    if (input == null) input = !global.maintain;

    if (input) {
        if (global.maintain) return message.reply(getLang("alreadyOn"));
        global.maintain = true;

        message.reply(getLang("on"));
    } else {
        if (!global.maintain) return message.reply(getLang("alreadyOff"));
        global.maintain = false;

        message.reply(getLang("off"));
    }
}

export default {
    config,
    langData,
    onCall
}
