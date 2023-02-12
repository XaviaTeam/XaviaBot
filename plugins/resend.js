const exts = {
    "photo": ".jpg",
    "video": ".mp4",
    "audio": ".mp3",
    "animated_image": ".gif",
    "share": ".jpg",
    "file": ""
}

export default async function ({ event }) {
    if (event.senderID == global.botID) return;
    const { api } = global;
    const { Threads, Users } = global.controllers;
    const { threadID, messageID, senderID } = event;
    const threadData = await Threads.getData(threadID) || {};

    if (!threadData.hasOwnProperty("resend") || threadData.resend == false) return;

    if (!global.data.messages.some(item => item.messageID == messageID)) return;
    let getMessage = global.data.messages.find(item => item.messageID == messageID);
    let username = (await Users.getInfo(senderID))?.name || senderID;
    let messageObject = {},
        msg = "";

    if (!getMessage.body && getMessage.attachments.length == 0) {
        return api.sendMessage(getLang("plugins.resend.noMessage", { author: username }), threadID);
    }
    let attachments = [];
    let filePath = [];
    if (getMessage.attachments.length > 0) {
        if (getMessage.body) msg = getLang("plugins.resend.unsendMessageAndAttach", {
            author: username,
            message: getMessage.body,
            attachmentsCount: getMessage.attachments.length
        })
        else msg = getLang("plugins.resend.unsendNoMessageButAttach", {
            author: username,
            attachmentsCount: getMessage.attachments.length
        })
        for (let i = 0; i < getMessage.attachments.length; i++) {
            try {
                const filename = getMessage.attachments[i].filename || `${Date.now()}_${senderID}_${i}`;
                const ext = exts[getMessage.attachments[i].type] || "";
                if (filename + ext == ".gitkeep" || filename + ext == 'README.txt') continue;
                const savePath = `${global.cachePath}/${filename + ext}`;
                await global.downloadFile(savePath, getMessage.attachments[i].url);
                attachments.push(reader(savePath));
                filePath.push(savePath);
            } catch (err) {
                console.error(err);
            }
        }
        messageObject = {
            body: msg,
            attachment: attachments
        }
    } else if (getMessage.body) {
        messageObject.body = getLang("plugins.resend.unsendMessage", {
            author: username,
            message: getMessage.body
        });
    }
    if (Object.keys(messageObject).length > 0) {
        return api.sendMessage(messageObject, threadID, async () => {
            if (filePath)
                for (let i = 0; i < filePath.length; i++) {
                    try {
                        global.deleteFile(filePath[i]);
                    } catch (err) {
                        console.error(err);
                    }
                }
        });
    }
}
