const text = {
    "unsendNoBody": "• %1 has unsend a message",
    "unsendNoBodyButAttach": "• %1 has unsend %2 attachments",
    "unsendBodyAndAttach": "• %1 has unsend a message:\n%2\n• With %3 attachments:",
    "unsendBody": "• %1 has unsend a message:\n%2"
}

const getText = (key, ...args) => {
    if (text[key]) {
        return text[key].replace(/%(\d+)/g, (match, p1) => args[p1 - 1]);
    }
    return key;
}

import { writeFileSync, createReadStream, unlinkSync } from 'fs';
import get from 'axios';

const exts = {
    "photo": ".jpg",
    "video": ".mp4",
    "audio": ".mp3",
    "animated_image": ".gif",
    "share": ".jpg",
    "file": ''
}
const cachePath = process.cwd() + '/plugins/cache/';

export default async function ({ api, event, db, controllers }) {
    const { Threads, Users } = controllers;
    const { threadID, messageID, senderID } = event;
    if (client.maintainance && !client.config.debugThreads.includes(threadID)) return;
    const threadData = await Threads.getData(threadID) || {};

    if (!threadData.hasOwnProperty("resend")) return;
    if (threadData.resend == false) return;

    if (!client.data.message.some(item => item.msgID == messageID)) return;
    var getMsg = client.data.message.find(item => item.msgID == messageID);
    let name = await Users.getName(senderID);
    var messageObject = {},
        msg = '';

    if (!getMsg.body && getMsg.attachment.length == 0) {
        return api.sendMessage(getText('unsendNoBody', name), threadID, messageID);
    }
    if (getMsg.attachment.length > 0) {
        if (getMsg.body) msg = getText('unsendBodyAndAttach', name, getMsg.body, getMsg.attachment.length);
        else msg = getText('unsendNoBodyButAttach', name, getMsg.attachment.length);
        var attachment = [];
        var filePath = [];
        for (let i = 0; i < getMsg.attachment.length; i++) {
            try {
                const { fileName } = getMsg.attachment[i] || `${Date.now()}_${senderID}_${i}`;
                const ext = exts[getMsg.attachment[i].type] || '';
                const savePath = `${cachePath}${fileName + ext}`;
                const mediaBuffer = (await get(getMsg.attachment[i].url, { responseType: 'arraybuffer' })).data;
                writeFileSync(savePath, Buffer.from(mediaBuffer, 'utf-8'));
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
        messageObject.body = getText('unsendBody', name, getMsg.body);
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
