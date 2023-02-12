const config = {
    name: "user",
    description: "ban/unban a user",
    version: "0.0.1-beta",
    usage: "[tag/reply]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "vi_VN": {
        "missingTarget": "Vui lòng tag/reply người cần ban.",
        "noData": "Dữ liệu không khả dụng...",
        "success": "Thành công!",
        "error": "lỗi"
    },
    "en_US": {
        "missingTarget": "Please tag/Reply to a user that you want to ban.",
        "noData": "No data available...",
        "success": "Success!",
        "error": "error"
    }
}

async function onCall({ message, args, getLang, data }) {
    try {
        const { mentions, messageReply, type } = message;
        const query = args[0]?.toLowerCase();
        if (query != "ban" && query != "unban") return;

        const targetIDs =
            Object.keys(mentions).length > 0 ? Object.keys(mentions) :
                type == "message_reply" ? [messageReply.senderID] : null;

        if (!targetIDs) return message.reply(getLang("missingTarget"));

        const members = data?.thread?.info?.members;
        if (!members) return message.reply(getLang("noData"));

        if (query == "ban") {
            for (const id of targetIDs) {
                if (members.find(e => e.userID == id))
                    members.find(e => e.userID == id).banned = true;
            }
        } else {
            for (const id of targetIDs) {
                if (members.find(e => e.userID == id))
                    members.find(e => e.userID == id).banned = false;
            }
        }

        await global.controllers.Threads.updateInfo(message.threadID, { members });
        message.reply(getLang("success"));
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
