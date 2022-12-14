const config = {
    name: "wanted",
    description: "wanted image creator",
    usage: "[@mention/reply] [text]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "vi_VN": {
        "error": "Có lỗi xảy ra, vui lòng thử lại sau"
    },
    "en_US": {
        "error": "An error occurred, please try again later"
    },
    "ar_SY": {
        "error": "لقد حدث خطأ، رجاء أعد المحاولة لاحقا"
    }
}

async function onCall({ message, getLang }) {
    try {
        const { mentions, messageReply, senderID } = message;
        const targetID = Object.keys(mentions)[0] || messageReply?.senderID || senderID;

        const avatarURL = global.getAvatarURL(targetID);

        global.request(`${global.xva_api.main}/imgbb`, {
            method: "POST",
            data: {
                url: avatarURL
            }
        }, async (error, res, data) => {
            if (error) {
                console.error(error);
                return message.reply(getLang("error"));
            }

            const wanted = await global.getStream(`${global.xva_api.popcat}/wanted?image=${res.data.url}`);

            return message.reply({
                attachment: wanted
            });
        })

    } catch (e) {
        console.error(e);
        return message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}
