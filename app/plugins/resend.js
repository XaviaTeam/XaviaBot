import { writeFileSync, createReadStream, unlinkSync } from "fs";

const exts = {
    "photo": ".jpg",
    "video": ".mp4",
    "audio": ".mp3",
    "animated_image": ".gif",
    "share": ".jpg",
    "file": ""
}
const cachePath = process.cwd() + "/plugins/cache/";

export default async function ({ api, event, db, controllers }) {
    const { Threads, Users } = controllers;
    const { threadID, messageID, senderID } = event;
    if (client.maintainance && !client.config.debugThreads.includes(threadID)) return;
    const threadData = await Threads.getData(threadID) || {};

    if (!threadData.hasOwnProperty("resend")) return;
    if (threadData.resend == false) return;

    if (!client.data.message.some(item => item.msgID == messageID)) return;
    let getMsg = client.data.message.find(item => item.msgID == messageID);
    let name = await Users.getName(senderID);
    let messageObject = {},
        msg = "";

    if (!getMsg.body && getMsg.attachment.length == 0) {
        return api.sendMessage(getLang("plugins.resend.noMessage", { author: name }), threadID);
    }
    if (getMsg.attachment.length > 0) {
        if (getMsg.body) msg = getLang("plugins.resend.unsendMessageAndAttach", {
            author: name,
            message: getMsg.body,
            attachmentsCount: getMsg.attachment.length
        })
        else msg = getLang("plugins.resend.unsendNoMessageButAttach", {
            author: name,
            attachmentsCount: getMsg.attachment.length
        })
        let attachment = [];
        let filePath = [];
        for (let i = 0; i < getMsg.attachment.length; i++) {
            try {
                const { fileName } = getMsg.attachment[i] || `${Date.now()}_${senderID}_${i}`;
                const ext = exts[getMsg.attachment[i].type] || "";
                if (fileName + ext == ".gitkeep" || fileName + ext == 'README.txt') continue;
                const savePath = `${cachePath}${fileName + ext}`;
                const mediaBuffer = (await get(getMsg.attachment[i].url, { responseType: "arraybuffer" })).data;
                writeFileSync(savePath, Buffer.from(mediaBuffer, "utf-8"));
                attachment.push(createReadStream(savePath));
                filePath.push(savePath);
            } catch (err) {
                console.log(err);
            }
        }
        messageObject = {
            body: msg,
            attachment: attachment
        }
    } else if (getMsg.body) {
        messageObject.body = getLang("plugins.resend.unsendMessage", {
            author: name,
            message: getMsg.body
        });
    }
    if (Object.keys(messageObject).length > 0) {
        return api.sendMessage(messageObject, threadID, () => {
            if (filePath)
                for (let i = 0; i < filePath.length; i++) {
                    unlinkSync(filePath[i]);
                }
        });
    }
}
