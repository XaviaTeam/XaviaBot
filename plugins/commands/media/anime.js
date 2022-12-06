const config = {
    name: "anime",
    description: "anime images",
    usage: "[category]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "en_US": {
        "invalidCategory": "Invalid, available catagories:\n{categories}",
        "error": "Error, try again later."
    },
    "vi_VN": {
        "invalidCategory": "Không hợp lệ, các danh mục hiện có:\n{categories}",
        "error": "Đã có lỗi xảy ra..."
    },
    "ar_SY": {
        "invalidCategory": "الفئات المتاحة غير صالحة:\n{categories}",
        "error": "خطأ ، حاول مرة أخرى في وقت لاحق..."
    }
}

const endpoints = ["waifu", "neko", "shinobu", "megumin", "bully", "cuddle", "cry", "hug", "awoo", "kiss", "lick", "pat", "smug", "bonk", "yeet", "blush", "smile", "wave", "highfive", "handhold", "nom", "bite", "glomp", "slap", "kill", "kick", "happy", "wink", "poke", "dance", "cringe"]

async function onCall({ message, args, getLang }) {
    try {
        const input = args[0]?.toLowerCase();
        if (!endpoints.includes(input)) return message.reply(getLang("invalidCategory", { categories: endpoints.join(", ") }));

        const response = await global.GET(`${global.xva_api.sfw}/${input}`);
        const data = response.data;

        if (!data.url) return message.reply(getLang("error"));

        const imageStream = await global.getStream(data.url);
        await message.reply({
            attachment: [imageStream]
        });
    } catch (e) {
        console.error(e);
        message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}
