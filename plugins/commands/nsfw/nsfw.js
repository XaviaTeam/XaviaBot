const config = {
    name: "nsfw",
    description: "On/Off Nsfw",
    usage: "[on/off]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "vi_VN": {
        "enabled": "Đã bật chế độ NSFW",
        "disabled": "Đã tắt chế độ NSFW",
        "dataNotReady": "Dữ liệu chưa sẵn sàng",
        "error": "Đã có lỗi xảy ra, {error}",
    },
    "en_US": {
        "enabled": "NSFW mode has been enabled",
        "disabled": "NSFW mode has been disabled",
        "dataNotReady": "Data is not ready",
        "error": "An error has occurred, {error}",
    },
    "ar_SY": {
        "enabled": "تم تفعيل وضع سكس",
        "disabled": "تم تعطيل وضع البالغ",
        "dataNotReady": "البيانات ليست جاهزة",
        "error": "حدث خطأ, {error}",
    }
}

async function onCall({ message, args, getLang }) {
    try {
        const { Threads } = global.controllers;
        let choice = args[0]?.toLowerCase();
        let threadData = await Threads.getData(message.threadID);
        if (threadData == null) return message.reply(getLang("dataNotReady"));

        choice = choice == "on" ? true : choice == "off" ? false : !threadData.nsfw;
        let result = await Threads.updateData(message.threadID, { nsfw: choice });

        if (!result) return message.reply(getLang("error", { error: null }));
        return message.reply(getLang(choice ? "enabled" : "disabled"));
    } catch (err) {
        console.error(err);
        message.reply(getLang("error", { error: err }));
    }
}

export default {
    config,
    langData,
    onCall
}
