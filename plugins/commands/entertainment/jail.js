import Canvas from 'canvas';
import { writeFileSync } from 'fs';
import { join } from 'path';

const config = {
    name: "jail",
    description: "Jail a user",
    usage: "<@mention/reply>",
    credits: "XaviaTeam",
    cooldown: 5
}

async function makeImage(data) {
    const { savePath, avatarPath } = data;

    try {
        const template = await Canvas.loadImage(join(global.assetsPath, 'jail.png'));
        const avatar = await Canvas.loadImage(avatarPath);

        const canvas = new Canvas.createCanvas(avatar.width, avatar.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(avatar, 0, 0);
        ctx.drawImage(template, 0, 0, avatar.width, avatar.height);

        writeFileSync(savePath, canvas.toBuffer());
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function onCall({ message }) {
    const { type, messageReply, mentions, senderID } = message;
    let savePath, avatarPath;
    try {
        let targetID = type == 'message_reply' ? messageReply.senderID : Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID;

        const targetData = await global.controllers.Users.get(targetID);
        if (!targetData || !targetData.info || !targetData.info.thumbSrc) return;

        savePath = join(global.cachePath, `jail_${targetID}_${Date.now()}.png`);
        avatarPath = join(global.cachePath, `rank_avatar_${targetID}_${Date.now()}.jpg`);
        await global.downloadFile(avatarPath, targetData.info.thumbSrc);
        let result = await makeImage({ savePath, avatarPath });

        if (!result) message.reply("Error");
        else await message.reply({ attachment: global.reader(savePath) });
    } catch (e) {
        console.error(e);
        message.reply("Error");
    }

    cleanup(avatarPath, savePath);
}

function cleanup(avatarPath, savePath) {
    try {
        if (global.isExists(savePath)) global.deleteFile(savePath);
        if (global.isExists(avatarPath)) global.deleteFile(avatarPath);
    } catch (e) {
        console.error(e);
    }
}

export default {
    config,
    onCall
}
