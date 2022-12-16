const config = {
    name: "unsend",
    aliases: ["gỡ"],
    description: "Unsend bot's message",
    usage: "[reply/on/off]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "vi_VN": {
        "dataNotReady": "Dữ liệu của nhóm chưa sẵn sàng",
        "notReply": "Bạn phải reply tin nhắn của bot",
        "notBotMessage": "Tin nhắn bạn reply không phải của bot",
        "notAllowed": "Nhóm này không chi cho phép gỡ tin nhắn bot",
        "alreadyOn": "Chức năng gỡ tin nhắn bot đã được bật",
        "on": "Đã bật chức năng gỡ tin nhắn bot",
        "alreadyOff": "Chức năng gỡ tin nhắn bot đã được tắt",
        "off": "Đã tắt chức năng gỡ tin nhắn bot",
        "notAllowedToTurnOn": "Bạn không có đủ quyền hạn để bật chức năng này",
        "notAllowedToTurnOff": "Bạn không có đủ quyền hạn để tắt chức năng này",
        "error": "Đã có lỗi xảy ra"
    },
    "en_US": {
        "dataNotReady": "The group's data is not ready",
        "notReply": "You must reply to the bot's message",
        "notBotMessage": "The message you reply is not from the bot",
        "notAllowed": "This group is not allowed to unsend bot's message",
        "alreadyOn": "The unsend bot's message feature is already on",
        "on": "Turned on the unsend bot's message feature",
        "alreadyOff": "The unsend bot's message feature is already off",
        "off": "Turned off the unsend bot's message feature",
        "notAllowedToTurnOn": "You don't have enough permissions to turn on this feature",
        "notAllowedToTurnOff": "You don't have enough permissions to turn off this feature",
        "error": "An error has occurred"
    },
    "ar_SY": {
        "dataNotReady": "بيانات المجموعة غير جاهزة",
        "notReply": "يجب عليك الرد على رسالة الروبوت",
        "notBotMessage": "الرسالة التي ترد عليها ليست من الروبوت",
        "notAllowed": "هذه المجموعة غير مسموح لها بإلغاء إرسال رسالة الروبوت",
        "alreadyOn": "ميزة رسالة إلغاء إرسال الروبوت قيد التشغيل بالفعل",
        "on": "تم تشغيل ميزة إلغاء إرسال رسالة الروبوت",
        "alreadyOff": "ميزة رسالة إلغاء إرسال البوت متوقفة بالفعل",
        "off": "تم إيقاف تشغيل ميزة إلغاء إرسال رسالة الروبوت",
        "notAllowedToTurnOn": "ليس لديك أذونات كافية لتشغيل هذه الميزة",
        "notAllowedToTurnOff": "ليس لديك صلاحيات كافية لإيقاف تشغيل هذه الميزة",
        "error": "حدث خطأ"
    }
}

async function onCall({ message, args, getLang, data, userPermissions }) {
    try {
        const thread = data?.thread;
        if (!thread) return message.reply(getLang("dataNotReady"));

        const threadData = thread.data || {};
        const isAllowed = threadData?.unsend === true;
        const input = args[0]?.toLowerCase();
        const isInputQuery = input == "on" || input == "off";

        const isGroupAdmin = userPermissions.some(e => e == 1);

        if (isGroupAdmin && isInputQuery) {
            if (input == "on") {
                if (isAllowed) return message.reply(getLang("alreadyOn"));

                await global.controllers.Threads.updateData(message.threadID, { unsend: true });
                return message.reply(getLang("on"));
            } else {
                if (!isAllowed) return message.reply(getLang("alreadyOff"));

                await global.controllers.Threads.updateData(message.threadID, { unsend: false });
                return message.reply(getLang("off"));
            }
        } else if (!isGroupAdmin && isInputQuery) {
            if (input == "on") return message.reply(getLang("notAllowedToTurnOn"));
            else return message.reply(getLang("NotAllowedToTurnOff"));
        } else {
            if (message.type != "message_reply") return message.reply(getLang("notReply"));
            if (message.messageReply?.senderID != global.botID) return message.reply(getLang("notBotMessage"));

            if (!isAllowed) return message.reply(getLang("notAllowed"));

            const targetMessageID = message.messageReply.messageID;

            return global.api.unsendMessage(targetMessageID, (e) => {
                if (e) return message.react("❌");
                message.react("✅");
            });
        }
    } catch (err) {
        console.error(err);
        message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}
