import { readdirSync } from "fs";
import { join } from "path";

function onLoad() {
    const levelup_gifs = readdirSync(join(global.assetsPath, "levelup_gifs")).filter(file => file.endsWith(".gif"));
    global.getLevelupGif = () => levelup_gifs[Math.floor(Math.random() * levelup_gifs.length)];
}

const langData = {
    "en_US": {
        "levelup": "{name}, you have leveled up to level {level}!",
    },
    "vi_VN": {
        "levelup": "{name}, bạn đã lên cấp {level}!"
    }
}

function onCall({ message, getLang }) {
    if (message.senderID == botID) return;
    const { senderID, threadID } = message;

    if (global.data.users.has(senderID)) {
        let currentLevel = global.expToLevel(global.data.users.get(senderID)?.data.exp || 0);
        const user = global.data.users.get(senderID);
        const userData = user.data || {};
        if (!userData.hasOwnProperty('exp')) userData.exp = 0;
        userData.exp += 1;

        user.data = userData;
        global.data.users.set(senderID, user);
        if (global.data.threads.get(threadID)?.data?.levelup_noti === true) {
            let newLevel = global.expToLevel(global.data.users.get(senderID)?.data?.exp || 0);
            if (newLevel > currentLevel) {
                let username = global.data.users.get(senderID)?.info?.name || senderID;
                message.reply({
                    body: getLang("levelup", { name: username, level: newLevel }),
                    mentions: [{ tag: username, id: senderID }],
                    attachment: global.reader(join(global.assetsPath, "levelup_gifs", global.getLevelupGif()))
                });
            }
        }
    }

    if (global.data.threads.has(threadID)) {
        const thread = global.data.threads.get(threadID);
        const threadInfo = thread?.info;
        if (threadInfo.members.some(member => member.userID == senderID)) {
            const memberIndex = threadInfo.members.findIndex(member => member.userID == senderID);
            if (memberIndex !== -1) {
                if (typeof threadInfo.members[memberIndex].exp !== 'number') threadInfo.members[memberIndex].exp = 1;
                threadInfo.members[memberIndex].exp += 1;
                thread.info = threadInfo;
                global.data.threads.set(threadID, thread);
            }
        }
    }
}

export default {
    onLoad,
    langData,
    onCall
}
