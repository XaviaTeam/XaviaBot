import Canvas from 'canvas';
import { writeFileSync } from 'fs';
import { join } from 'path';

const config = {
    name: "love",
    description: "Love banner with a user",
    usage: "<@mention/reply>",
    credits: "XaviaTeam",
    cooldown: 5
}

async function makeImage(data) {
    const { savePath, avatarPathOne, avatarPathTwo } = data;

    try {
        const template = await Canvas.loadImage(join(global.assetsPath, 'love.png'));

        const avatarOne = await Canvas.loadImage(avatarPathOne);
        const avatarTwo = await Canvas.loadImage(avatarPathTwo);

        const avatarOneCircle = await global.circle(avatarOne, avatarOne.width / 2, avatarOne.height / 2, avatarOne.width / 2);
        const avatarTwoCircle = await global.circle(avatarTwo, avatarTwo.width / 2, avatarTwo.height / 2, avatarTwo.width / 2);

        const canvas = new Canvas.createCanvas(template.width, template.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(template, 0, 0);
        ctx.drawImage(avatarOneCircle, 338, 205, 211, 211);
        ctx.drawImage(avatarTwoCircle, 562, 210, 211, 211);

        writeFileSync(savePath, canvas.toBuffer());
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

const langData = {
    "en_US": {
        "missingTarget": "Please mention/reply to a user",
        "loveMessage": "Together till the end of time <3"
    },
    "vi_VN": {
        "missingTarget": "Vui lòng tag hoặc reply một người dùng",
        "loveMessage": "Mãi bên nhau bạn nhé <3"
    }
}

async function onCall({ message, getLang }) {
    const { type, messageReply, mentions, senderID } = message;
    let savePath, avatarPathOne, avatarPathTwo;
    try {
        let targetID = type == 'message_reply' ? messageReply.senderID : Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID;

        if (targetID == senderID) return message.reply(getLang('missingTarget'));

        const selfData = await global.controllers.Users.get(senderID);
        if (!selfData || !selfData.info || !selfData.info.thumbSrc) return;

        const targetData = await global.controllers.Users.get(targetID);
        if (!targetData || !targetData.info || !targetData.info.thumbSrc) return;

        savePath = join(global.cachePath, `love_${targetID}_${Date.now()}.png`);
        avatarPathOne = join(global.cachePath, `rank_avatar_${senderID}_${Date.now()}.jpg`);
        avatarPathTwo = join(global.cachePath, `rank_avatar_${targetID}_${Date.now()}.jpg`);
        await global.downloadFile(avatarPathOne, selfData.info.thumbSrc);
        await global.downloadFile(avatarPathTwo, targetData.info.thumbSrc);

        let result = await makeImage({ savePath, avatarPathOne, avatarPathTwo });

        if (!result) message.reply("Error");
        else await message.reply({ body: getLang("loveMessage"), attachment: global.reader(savePath) });

    } catch (e) {
        console.error(e);
        message.reply("Error");
    }

    cleanup(savePath, avatarPathOne, avatarPathTwo);
}

function cleanup(savePath, avatarPathOne, avatarPathTwo) {
    try {
        if (global.isExists(savePath)) global.deleteFile(savePath);
        if (global.isExists(avatarPathOne)) global.deleteFile(avatarPathOne);
        if (global.isExists(avatarPathTwo)) global.deleteFile(avatarPathTwo);
    } catch (e) {
        console.error(e);
    }
}

export default {
    config,
    langData,
    onCall
}
