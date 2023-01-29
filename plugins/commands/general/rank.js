import Canvas from 'canvas';
import { writeFileSync } from 'fs';
import { join } from 'path';

const config = {
    description: 'Get your global/local rank',
    usage: "[-g/-l] [@mention/reply]",
    credits: "XaviaTeam",
    cooldown: 10
}

function progressBar(ctx, x, y, width, radius, progress) {
    ctx.fillStyle = '#d2d2d2';
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y + radius * 2, x + width - radius, y + radius * 2);
    ctx.lineTo(x + radius, y + radius * 2);
    ctx.quadraticCurveTo(x, y + radius * 2, x, y + radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();

    // draw the progress
    if (progress === 0) return;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + (width * progress / 100) - radius, y);
    ctx.quadraticCurveTo(x + (width * progress / 100), y, x + (width * progress / 100), y + radius);
    ctx.lineTo(x + (width * progress / 100), y + radius);
    ctx.quadraticCurveTo(x + (width * progress / 100), y + radius * 2, x + (width * progress / 100) - radius, y + radius * 2);
    ctx.lineTo(x + radius, y + radius * 2);
    ctx.quadraticCurveTo(x, y + radius * 2, x, y + radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

async function makeCard(data) {
    const { savePath, avatarPath, name, rank, exp, level, expToNextLevel } = data;
    try {
        const template = await Canvas.loadImage(join(global.assetsPath, 'rank_card.png'));
        const avatar = await Canvas.loadImage(avatarPath);
        const circledAvatar = global.circle(avatar, avatar.width / 2, avatar.height / 2, avatar.width / 2);

        const canvas = new Canvas.createCanvas(template.width, template.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(template, 0, 0);
        ctx.drawImage(circledAvatar, 15, 21, 101, 101);

        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(name, 136, 43);

        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Rank ${rank}`, 136, 66);

        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Lv.${level}`, 136, 87);

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${exp}/${expToNextLevel}`, 270, 87);

        let percent = (exp / expToNextLevel) * 100;
        percent = percent > 0 ? percent % 5 === 0 ? percent : Math.round(percent / 5) * 5 : 0;

        progressBar(ctx, 134, 98, 230, 7, percent);

        const buffer = canvas.toBuffer('image/png');
        writeFileSync(savePath, buffer);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

const langData = {
    "en_US": {
        "rank_all_local": "--- Leaderboard ---\n👤 Your exp: {senderExp} #{senderRank}\n📕 Members:\n{allData}",
        "rank_all_global": "--- Leaderboard ---\n👤 Your exp: {senderExp} #{senderRank}\n📕 Global Top 20:\n{allData}",
    },
    "vi_VN": {
        "rank_all_local": "-- Xếp hạng tương tác --\n👤 Exp của bạn: {senderExp} #{senderRank}\n📕 Thành viên:\n{allData}",
        "rank_all_global": "-- Xếp hạng tương tác --\n👤 Exp của bạn: {senderExp} #{senderRank}\n📕 Top 20 global:\n{allData}",
    },
    "ar_SY": {
        "rank_all_local": "-- تقييم التفاعل --\n👤 المستوى الخاص بك: {senderExp} #{senderRank}\n📕 أعضاء:\n{allData}",
        "rank_all_global": "-- تقييم التفاعل --\n👤 المستوى الخاص بك: {senderExp} #{senderRank}\n📕 افضل 20 متفاعلا:\n{allData}",
    }
}

async function onCall({ message, args, getLang }) {
    const { type, messageReply, mentions, senderID, threadID, participantIDs } = message;
    let savePath, avatarPath;
    try {
        if (args.some(e => e.toLowerCase() == '-a' || e.toLowerCase() == 'all')) {
            let _listOf = args.some(e => e.toLowerCase() == '-g' || e.toLowerCase() == 'global') ? 'global' : 'local';
            const allData = _listOf == 'global' ?
                Array
                    .from(global.data.users.values())
                    .map(e => ({ userID: e.userID, exp: e.data?.exp || 1 })) :
                (global.data.threads.get(String(threadID))?.info?.members) || [];

            if (allData.length == 0) return;

            const sortedData = allData
                .filter(e => participantIDs.includes(e.userID))
                .map(e => ({ userID: e.userID, exp: e.exp || (_listOf == 'global' ? 1 : 0) }))
                .sort((a, b) => a.exp == b.exp ? a.userID.localeCompare(b.userID) : b.exp - a.exp);

            const allData_withName = await Promise.all(sortedData.map(async e => {
                const name = (await global.controllers.Users.getInfo(e.userID))?.name || e.userID;
                return { ...e, name };
            }));

            const senderExp = allData_withName.find(e => e.userID == senderID)?.exp || 0;
            const senderRank = allData_withName.findIndex(e => e.userID == senderID) + 1;

            return message.reply(getLang(_listOf == 'global' ? "rank_all_global" : "rank_all_local", {
                senderExp,
                senderRank,
                allData: (_listOf == 'global' ? allData_withName.slice(0, 20) : allData_withName).map((e, i) => `${i + 1}. ${e.name} (${e.userID}) - ${e.exp} exp`).join('\n')
            }))
        }


        let targetID = type == 'message_reply' ? messageReply.senderID : Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID;
        let _listOf = args[0]?.toLowerCase();
        _listOf = (_listOf == '-g' || _listOf == 'global') ? 'global' : (_listOf == '-l' || _listOf == 'local') ? 'local' : 'local';
        const allData = _listOf == 'global' ?
            Array
                .from(global.data.users.values())
                .map(e => ({ userID: e.userID, exp: e.data?.exp || 1 })) :
            (global.data.threads.get(String(threadID))?.info?.members) || [];

        if (allData.length == 0 || !allData.some(e => e.userID == targetID)) return;
        const targetData = await global.controllers.Users.get(targetID);
        if (!targetData || !targetData.info || !targetData.info.thumbSrc) return;

        const sortedData = allData
            .filter(e => participantIDs.includes(e.userID))
            .map(e => ({ userID: e.userID, exp: e.exp || (_listOf == 'global' ? 1 : 0) }))
            .sort((a, b) => a.exp == b.exp ? a.userID.localeCompare(b.userID) : b.exp - a.exp);

        const rank = sortedData.findIndex(e => e.userID == targetID) + 1;
        const exp = sortedData[rank - 1].exp || 1;
        const level = global.expToLevel(exp);

        const currentExp = exp - global.levelToExp(level);
        const expToNextLevel = global.levelToExp(level + 1) - global.levelToExp(level);

        savePath = join(global.cachePath, `rank_${targetID}_${Date.now()}.png`);
        avatarPath = join(global.cachePath, `rank_avatar_${targetID}_${Date.now()}.jpg`);

        await global.downloadFile(avatarPath, targetData.info.thumbSrc);
        let result = await makeCard({ savePath, avatarPath, name: targetData.info.name, rank, exp: currentExp, level, expToNextLevel });

        if (!result) message.reply("Error");
        else await message.reply({ attachment: global.reader(savePath) });
    } catch (e) {
        console.error(e);
        message.reply("Error");
    }

    cleanup(savePath, avatarPath);
}

function cleanup(savePath, avatarPath) {
    try {
        if (global.isExists(savePath)) global.deleteFile(savePath);
        if (global.isExists(avatarPath)) global.deleteFile(avatarPath);
    } catch (e) {
        console.error(e);
    }
}

export default {
    config,
    langData,
    onCall
}
