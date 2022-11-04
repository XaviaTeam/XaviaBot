const config = {
    name: "mods",
    aliases: ["moderators"],
    description: "List, Add or remove moderators",
    permissions: [2],
    cooldown: 5,
    extra: {
        "absolute": ["100008907121641"]  // List of moderators that can add/remove moderators
        // Danh sách các quản trị viên có thể thêm/xóa quản trị viên
    }
}

const langData = {
    "en_US": {
        "notAbsolute": "You are not an absolute moderator.",
        "alreadyModerator": "This user is already a moderator.",
        "notModerator": "This user is not a moderator.",
        "missingTarget": "Please mention or reply someone.",
        "add.success": "Added to moderator list:\n{added}",
        "remove.success": "Removed from moderator list:\n{removed}",
        "list": "Moderators:\n{moderators}",
        "error": "Error: {error}"
    },
    "vi_VN": {
        "notAbsolute": "Bạn không phải là quản trị viên tuyệt đối.",
        "alreadyModerator": "Người dùng này đã là quản trị viên.",
        "notModerator": "Người dùng này không phải là quản trị viên.",
        "missingTarget": "Vui lòng nhắc đến hoặc trả lời một người.",
        "add.success": "Đã thêm vào danh sách quản trị viên:\n{added}",
        "remove.success": "Đã xóa khỏi danh sách quản trị viên:\n{removed}",
        "list": "Quản trị viên:\n{moderators}",
        "error": "Lỗi: {error}"
    }
}

async function onCall({ message, args, extra, getLang }) {
    const { type, messageReply, mentions, senderID, reply } = message;
    const { absolute } = extra;

    try {
        const isAbsolute = absolute.some(id => id == senderID);

        let query = args[0]?.toLowerCase();
        switch (query) {
            case "add":
                {
                    if (!isAbsolute) return reply(getLang("notAbsolute"));

                    let success = [];
                    if (type == "message_reply") {
                        let userID = messageReply.senderID;
                        if (global.config.MODERATORS.some(id => id == userID)) return reply(getLang("alreadyModerator"));
                        global.config.MODERATORS.push(String(userID));
                        success.push({
                            id: userID,
                            name: (await global.controllers.Users.getInfo(userID))?.name || userID
                        });
                    } else if (Object.keys(mentions).length > 0) {
                        for (const userID in mentions) {
                            if (global.config.MODERATORS.some(id => id == userID)) continue;
                            global.config.MODERATORS.push(String(userID));
                            success.push({
                                id: userID,
                                name: mentions[userID].replace(/@/g, '')
                            });
                        }
                    } else return reply(getLang("missingTarget"));

                    global.config.save();
                    reply({
                        body: getLang("add.success", { added: success.map(user => user.name).join(", ") }),
                        mentions: success.map(user => ({ tag: user.name, id: user.id }))
                    });;

                    break;
                }
            case "remove":
            case "rm":
            case "delete":
            case "del":
                {
                    if (!isAbsolute) return reply(getLang("notAbsolute"));

                    let success = [];
                    if (type == "message_reply") {
                        let userID = messageReply.senderID;
                        if (!global.config.MODERATORS.some(id => id == userID)) return reply(getLang("notModerator"));
                        global.config.MODERATORS = global.config.MODERATORS.filter(id => id != userID);
                        success.push({
                            id: userID,
                            name: (await global.controllers.Users.getInfo(userID))?.name || userID
                        });
                    } else if (Object.keys(mentions).length > 0) {
                        for (const userID in mentions) {
                            if (!global.config.MODERATORS.some(id => id == userID)) continue;
                            global.config.MODERATORS = global.config.MODERATORS.filter(id => id != userID);
                            success.push({
                                id: userID,
                                name: mentions[userID].replace(/@/g, '')
                            });
                        }
                    } else return reply(getLang("missingTarget"));

                    global.config.save();
                    reply({
                        body: getLang("remove.success", { removed: success.map(user => user.name).join(", ") }),
                        mentions: success.map(user => ({ tag: user.name, id: user.id }))
                    });;

                    break;
                }
            default:
                {
                    let moderators = global.config.MODERATORS.map(async id => {
                        let info = await global.controllers.Users.getInfo(id);
                        return `${info?.name || id} (${id})`;
                    });
                    moderators = await Promise.all(moderators);

                    reply(getLang("list", { moderators: moderators.join("\n") }));
                    break;
                }
        }
    } catch (error) {
        reply(getLang("error", { error }));
    }

    return;
}

export default {
    config,
    langData,
    onCall
}
