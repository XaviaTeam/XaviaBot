const _12HOURS = 12 * 60 * 60 * 1000;
const config = {
    name: "refresh",
    aliases: ["rfs"],
    description: "Refresh thread data",
    permissions: [1, 2],
    cooldown: _12HOURS
}

const langData = {
    "en_US": {
        "success": "Refreshed thread data successfully.",
        "failed": "Failed to refresh thread data."
    },
    "vi_VN": {
        "success": "Đã làm mới dữ liệu nhóm thành công.",
        "failed": "Không thể làm mới dữ liệu nhóm."
    },
    "ar_SY": {
        "success": "تم تحديث بيانات المجموعة بنجاح.",
        "failed": "تعذر تحديث بيانات المجموعة."
    }
}

async function onCall({ message, getLang }) {
    if (!message.isGroup) return;
    try {
        let result = await global.controllers.Threads.getInfoAPI(message.threadID);
        if (result === null) return message.reply(getLang("error"));
        else return message.reply(getLang("success"));
    } catch (e) {
        console.error(e)
        message.reply(getLang("failed"));
    }
}

export default {
    config,
    langData,
    onCall
}
