const config = {
    name: "note",
    description: "note a message",
    usage: "[reply]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "en_US": {
        "dataNotReady": "Data is not ready, please try again later.",
        "alreadyNoted": "You already have a noted message in this thread, do you want to overwrite it?\nReact 👍 to overwrite.",
        "noted": "Noted!",
        "notNoted": "You don't have a noted message in this thread.",
        "note": ".",
        "error": "Error, try again later."
    },
    "vi_VN": {
        "dataNotReady": "Dữ liệu chưa sẵn sàng, vui lòng thử lại sau.",
        "alreadyNoted": "Bạn đã có một tin nhắn được note trong cuộc trò chuyện này, bạn có muốn ghi đè lên nó không?\nReact 👍 để ghi đè.",
        "noted": "Đã note!",
        "notNoted": "Bạn không có tin nhắn nào được note trong cuộc trò chuyện này.",
        "note": ".",
        "error": "Có lỗi xảy ra, vui lòng thử lại sau."
    },
    "ar_SY": {
        "dataNotReady": "البيانات ليست جاهزة ، يرجى المحاولة مرة أخرى في وقت لاحق.",
        "alreadyNoted": "لديك بالفعل ملاحظة في هذه الدردشة ، هل تريد استبدالها؟\nReact 👍 للكتابة.",
        "noted": "ملحوظة!",
        "notNoted": "ليس لديك رسائل لتلاحظها في هذه الدردشة.",
        "note": ".",
        "error": "خطأ ، حاول مرة أخرى في وقت لاحق."
    }
}

async function confirmOverwrite({ message, getLang, eventData }) {
    try {
        const { reaction, threadID, userID } = message;
        const { targetMessageID, note } = eventData;

        if (reaction != "👍") return;

        const index = note.findIndex(item => item.threadID == threadID);
        note[index] = { threadID, messageID: targetMessageID };

        await global.controllers.Users.updateData(userID, { note });

        await message.send(getLang("noted"), threadID, targetMessageID);
    } catch (e) {
        console.error(e);
        message.reply(getLang("error"));
    }
}

async function onCall({ message, args, getLang, data }) {
    try {
        const { type, messageReply, messageID, threadID } = message;
        const input = args[0]?.toLowerCase();

        if (!data?.user?.data) return message.reply(getLang("dataNotReady"));
        const note = data.user.data.note || [];

        let targetMessageID = messageID;
        if (type == "message_reply") {
            targetMessageID = messageReply.messageID;
        }

        if (input == "add") {
            const isNoted = note.find(item => item.threadID == threadID);
            if (isNoted)
                return message
                    .reply(getLang("alreadyNoted"))
                    .then(_ => _.addReactEvent({ callback: confirmOverwrite, targetMessageID, note }))
                    .catch(console.error);

            note.push({ threadID, messageID: targetMessageID });
            await global.controllers.Users.updateData(message.senderID, { note });

            await message.send(getLang("noted"), threadID, targetMessageID);
        } else {
            const isNoted = note.find(item => item.threadID == threadID);
            if (!isNoted) return message.reply(getLang("notNoted"));
            const notedMessageID = isNoted.messageID;

            await message.send(getLang("note"), threadID, notedMessageID);
        }
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
