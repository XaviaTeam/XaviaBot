const config = {
    name: "resend",
    permissions: [1, 2],
    description: "Turn on/off resend message",
    usage: "[on/off]",
    cooldown: 5,
    credits: "XaviaTeam"
}

const langData = {
    "en_US": {
        "resend.on": "Resend has been turned on.",
        "resend.off": "Resend has been turned off.",
        "resend.alreadyOn": "Resend is already turned on.",
        "resend.alreadyOff": "Resend is already turned off.",
        "error": "An error occurred, please try again later."
    },
    "vi_VN": {
        "resend.on": "Resend đã được bật.",
        "resend.off": "Resend đã được tắt.",
        "resend.alreadyOn": "Resend đã được bật trước đó.",
        "resend.alreadyOff": "Resend đã được tắt trước đó.",
        "error": "Đã xảy ra lỗi, vui lòng thử lại sau."
    },
    "ar_SY": {
        "resend.on": "تم تشغيل إعادة الإرسال.",
        "resend.off": "تم إيقاف إعادة الإرسال.",
        "resend.alreadyOn": "إعادة الإرسال قيد التشغيل بالفعل.",
        "resend.alreadyOff": "تم إيقاف إعادة الإرسال بالفعل.",
        "error": "لقد حدث خطأ، رجاء أعد المحاولة لاحقا."
    }
}

async function changeConfig(threadID, option) {
    const { Threads } = global.controllers;

    let threadData = await Threads.getData(threadID) || null;
    if (!threadData) throw "No Thread Data";

    if (option == null) {
        option = !Boolean(threadData.resend);
    } else if (option == threadData.resend) {
        throw "Already";
    } else {
        option = Boolean(option);
    }

    await Threads.updateData(threadID, { resend: option });
    return option;
}

async function onCall({ message, args, getLang }) {
    const { threadID, reply } = message;
    let option = args[0]?.toLowerCase();
    try {
        option = option == "on" ? true : option == "off" ? false : null;
        option = await changeConfig(threadID, option);

        reply(getLang(option ? "resend.on" : "resend.off"));
    } catch (e) {
        if (e == "Already") {
            reply(getLang("resend.already" + (option ? "On" : "Off")));
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
