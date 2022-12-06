const config = {
    name: "language",
    aliases: ["lang"],
    description: "choose bot language for group",
    usage: "[lang/reset/list]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "en_US": {
        "missingInput": "Missing input!",
        "allLangs": "Available languages:\n{availableLangs}",
        "resetSucceed": "Reset language to {language}",
        "changeSucceed": "Changed language to {language}",
        "invalidInput": "Invalid input, please try again.\n• Available inputs:\n{input}\n• Available languages:\n{availableLangs}",
        "error": "An error occurred, please try again later."
    },
    "vi_VN": {
        "missingInput": "Thiếu dữ kiện!",
        "allLangs": "Ngôn ngữ hỗ trợ:\n{availableLangs}",
        "resetSucceed": "Đã đặt lại thành ngôn ngữ thành {language}",
        "changeSucceed": "Đã đổi ngôn ngữ thành {language}",
        "invalidInput": "Dữ kiện không hợp lệ, vui lòng thử lại.\n• Các dữ kiện hợp lệ:\n{input}\n• Ngôn ngữ hỗ trợ:\n{availableLangs}",
        "error": "Có lỗi xảy ra, vui lòng thử lại sau."
    },
    "ar_SY": {
        "missingInput": "بيانات مفقودة!",
        "allLangs": "اللغات المتوفرة:\n{availableLangs}",
        "resetSucceed": "إعادة تعيين اللغة إلى {language}",
        "changeSucceed": "تم تغيير اللغة إلى {language}",
        "invalidInput": "إدخال غير صحيح ، يرجى المحاولة مرة أخرى.\n• المدخلات المتاحة:\n{input}\n• اللغات المتوفرة:\n{availableLangs}",
        "error": "لقد حدث خطأ، رجاء أعد المحاولة لاحقا."
    }
}

function getAvailableLangs() {
    const allFile = scanDir(`${global.corePath}/var/languages`).filter(e => e.endsWith('.yml'));
    return allFile.map(e => e.slice(0, -4));
}

async function onCall({ message, args, getLang, data }) {
    try {
        const input = args[0]?.toLowerCase();

        if (!input || input.length < 2) return message.reply(getLang("missingInput"));
        const threadData = data.thread?.data;
        if (!threadData) return message.reply(getLang("dataNotReady"));

        const availableLangs = getAvailableLangs();

        if (input == 'list' || input == 'all')
            return message.reply(getLang("allLangs", { availableLangs: availableLangs.join("\n") }))

        if (input == 'reset') {
            await global.controllers.Threads.updateData(message.threadID, { language: null });
            return message.reply(getLang("resetSucceed", { language: global.config.LANGUAGE }));
        }

        if (availableLangs.some(e => e.slice(0, 2).toLowerCase() == input.slice(0, 2))) {
            const chosenLang = availableLangs.find(e => e.slice(0, 2).toLowerCase() == input.slice(0, 2));
            if (chosenLang) {
                await global.controllers.Threads.updateData(message.threadID, { language: chosenLang });
                return message.reply(getLang("changeSucceed", { language: chosenLang }));
            } else return message.reply(getLang("error"));
        }

        return message.reply(getLang("invalidInput", { input: ["reset, list"], availableLangs: availableLangs.join(", ") }));
    } catch (e) {
        console.error(e);
        message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}
