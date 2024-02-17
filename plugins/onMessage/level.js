import { readdirSync } from "fs";
import { join } from "path";

function onLoad() {
    const levelup_gifs = readdirSync(join(global.assetsPath, "levelup_gifs")).filter((file) =>
        file.endsWith(".gif")
    );
    global.getLevelupGif = () => levelup_gifs[Math.floor(Math.random() * levelup_gifs.length)];
}

const langData = {
    en_US: {
        levelup: "{name}, you have leveled up to level {level}!",
    },
    vi_VN: {
        levelup: "{name}, bạn đã lên cấp {level}!",
    },
};

/** @type {TOnCallOnMessage} */
async function onCall({ message, getLang, data, xDB }) {
    if (message.senderID == botID) return;
    const { senderID, threadID } = message;
    const { Users } = xDB.controllers;

    const { user, thread } = data;

    if (user != null) {
        let currentLevel = global.utils.expToLevel(Users.getExp(senderID) || 1);
        Users.increaseExp(senderID, 1, false);

        if (thread != null && thread.data.levelup_noti === true) {
            let newLevel = global.utils.expToLevel(Users.getExp(senderID) || 1);
            if (newLevel > currentLevel) {
                const username = user.info.name ?? senderID;
                await message.reply({
                    body: getLang("levelup", {
                        name: username,
                        level: newLevel,
                    }),
                    mentions: [{ tag: username, id: senderID }],
                    attachment: global.utils.reader(
                        join(global.assetsPath, "levelup_gifs", global.getLevelupGif())
                    ),
                });
            }
        }
    }

    if (thread != null) {
        const threadInfo = thread.info;

        if (!threadInfo.hasOwnProperty("members")) {
            threadInfo.members = [];
            for (const participantID of message.participantIDs) {
                threadInfo.members.push({
                    userID: participantID,
                });
            }
        }

        const memberIndex = threadInfo.members.findIndex((member) => member.userID == senderID);
        if (memberIndex !== -1) {
            if (memberIndex !== -1) {
                if (!global.utils.isAcceptableNumber(threadInfo.members[memberIndex].exp))
                    threadInfo.members[memberIndex].exp = 0;

                threadInfo.members[memberIndex].exp += 1;
            }
        } else {
            threadInfo.members.push({
                userID: senderID,
                exp: 1,
            });
        }
    }
}

export default {
    onLoad,
    langData,
    onCall,
};
