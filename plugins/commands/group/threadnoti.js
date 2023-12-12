const config = {
    name: "threadnoti",
    permissions: [1, 2],
    description: "Turn on/off thread notification for yourself",
    usage: "[on/off]",
    cooldown: 5,
    credits: "XaviaTeam"
}

const langData = {
    "en_US": {
        "threadnoti.on": "Thread notification has been turned on.",
        "threadnoti.off": "Thread notification has been turned off.",
        "threadnoti.alreadyOn": "Thread notification is already turned on.",
        "threadnoti.alreadyOff": "Thread notification is already turned off.",
        "error": "An error occurred, please try again later."
    },
    "vi_VN": {
        "threadnoti.on": "Thông báo nhóm đã được bật.",
        "threadnoti.off": "Thông báo nhóm đã được tắt.",
        "threadnoti.alreadyOn": "Thông báo nhóm đã được bật từ trước.",
        "threadnoti.alreadyOff": "Thông báo nhóm đã được tắt từ trước.",
        "error": "Đã có lỗi xảy ra, vui lòng thử lại sau."
    },
    "ar_SY": {
        "threadnoti.on": "تم تشغيل إعلامات المجموعة.",
        "threadnoti.off": "تم إيقاف تشغيل إعلامات المجموعة.",
        "threadnoti.alreadyOn": "تم تمكين إعلامات المجموعة بالفعل.",
        "threadnoti.alreadyOff": "تم إيقاف تشغيل إعلامات المجموعة من قبل.",
        "error": "لقد حدث خطأ، رجاء أعد المحاولة لاحقا."
    }
}

async function changeConfig(threadID, senderID, option) {
    const { Threads } = global.controllers;

    let threadData = await Threads.getData(threadID) || null;
    if (!threadData) throw "No Thread Data";
    let notifyChange = threadData.notifyChange || { status: false, registered: [] };

    let currentSetting = notifyChange.status == true ? notifyChange.registered.includes(String(senderID)) ? true : false : false;
    if (option == null) {
        option = !currentSetting;
    } else if (option == currentSetting) {
        throw "Already";
    } else {
        option = Boolean(option);
    }

    if (option == true && notifyChange.registered.includes(String(senderID)) == false) {
        notifyChange.registered.push(String(senderID));
    } else if (option == false && notifyChange.registered.includes(String(senderID)) == true) {
        notifyChange.registered.splice(notifyChange.registered.indexOf(String(senderID)), 1);
    } else {
        throw "Already";
    }

    await Threads.updateData(threadID, { notifyChange: notifyChange });
    return option;
}

async function onCall({ message, args, getLang }) {
    if (!message.isGroup) return;
    const { threadID, senderID, reply } = message;
    let option = args[0]?.toLowerCase();
    try {
        option = option == "on" ? true : option == "off" ? false : null;
        option = await changeConfig(threadID, senderID, option);

        reply(getLang(option ? "threadnoti.on" : "threadnoti.off"));
    } catch (e) {
        if (e == "Already") {
            reply(getLang("threadnoti.already" + (option ? "On" : "Off")));
        } else {
            reply(getLang("error"));
        }
    }
}

export default {
    config,
    langData,
    onCall
}
