const config = {
    name: "rule34",
    aliases: [""],
    description: "Rule34 search",
    usage: "[keyword]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam",
    nsfw: true
}

const langData = {
    "vi_VN": {
        "noKeyword": "Bạn chưa nhập từ khóa",
        "noResult": "Không tìm thấy kết quả nào",
        "error": "Đã có lỗi xảy ra, {error}",
    },
    "en_US": {
        "noKeyword": "Missing keyword",
        "noResult": "No results found",
        "error": "An error has occurred, {error}",
    },
    "ar_SY": {
        "noKeyword": "الكلمة الرئيسية مفقودة",
        "noResult": "لم يتم العثور على نتائج",
        "error": "حدث خطأ, {error}",
    }
}

async function onCall({ message, args, getLang }) {
    try {
        if (!args[0]) return message.reply(getLang("noKeyword"));
        message.react("⏳");
        const data = (await GET(`https://xva-api.onrender.com/v1/rule34?tags=${encodeURIComponent(args.join("_"))}`)).data;
        if (!data.length) {
            message.react("❌");
            return message.reply(getLang("noResult"));
        }

        const imgStreams = [];

        for (const img of global.shuffleArray(data).slice(0, 9)) {
            imgStreams.push(await getStream(img.file_url));
        }

        if (!imgStreams.length) {
            message.react("❌");
            return message.reply(getLang("noResult"));
        }

        await message.reply({ attachment: imgStreams });
        return message.react("✅");

    } catch (error) {
        return message.reply(getLang("error", { error: error.message }))
    }
}

export default {
    config,
    langData,
    onCall
}
