const config = {
    name: "rule34",
    description: "Rule34 search",
    usage: "[keyword]",
    cooldown: 5,
    permissions: [0, 1, 2],
    credits: "XaviaTeam",
    nsfw: true
}

const langData = {
    "vi_VN": {
        "userNoData": "Bạn chưa có dữ liệu, hãy sử dụng lệnh {prefix}daily để nhận thưởng hàng ngày",
        "notEnoughMoney": "Bạn không đủ tiền để sử dụng lệnh này, cần {cost}XC để sử dụng",
        "noKeyword": "Bạn chưa nhập từ khóa",
        "noResult": "Không tìm thấy kết quả nào",
        "error": "Đã có lỗi xảy ra, {error}",
    },
    "en_US": {
        "userNoData": "You don't have any data, use {prefix}daily to get daily reward",
        "notEnoughMoney": "You don't have enough money to use this command, need {cost}XC to use",
        "noKeyword": "Missing keyword",
        "noResult": "No results found",
        "error": "An error has occurred, {error}",
    },
    "ar_SY": {
        "userNoData": "ليس لديك أي بيانات ، استخدم {prefix}daily للحصول على مكافأة يومية",
        "notEnoughMoney": "ليس لديك ما يكفي من المال لاستخدام هذا الأمر ، يحتاج {cost}XC للاستخدام",
        "noKeyword": "الكلمة الرئيسية مفقودة",
        "noResult": "لم يتم العثور على نتائج",
        "error": "حدث خطأ, {error}",
    }
}

const USAGE_COST = 1000;
async function onCall({ message, args, getLang, prefix }) {
    const { Users } = global.controllers
    try {
        const userMoney = await Users.getMoney(message.senderID) || null;
        if (userMoney === null) return message.reply(getLang("userNoData", { prefix }));
        if (BigInt(userMoney) < USAGE_COST) return message.reply(getLang("notEnoughMoney", { cost: USAGE_COST }));

        if (!args[0]) return message.reply(getLang("noKeyword"));

        await Users.decreaseMoney(message.senderID, USAGE_COST);

        message.react("⏳");
        const data = (await GET(`${global.xva_api.rule34}/rule34?tags=${encodeURIComponent(args.join("_"))}`)).data;
        if (!data.length) {
            message.react("❌");
            return message.reply(getLang("noResult"));
        }

        const imgStreams = [];

        for (const img of global.shuffleArray(
            data.
                filter((img) => img.file_url.endsWith(".jpg") || img.file_url.endsWith(".png")) || img.file_url.endsWith(".jpeg")
        ).slice(0, 9)) {
            imgStreams.push(await getStream(`${global.xva_api.rule34}/getImage?url=${encodeURIComponent(img.file_url)}`));
        }

        if (!imgStreams.length) {
            message.react("❌");
            return message.reply(getLang("noResult"));
        }

        await message.reply({ attachment: imgStreams });
        return message.react("✅");

    } catch (error) {
        message.react("❌");
        return message.reply(getLang("error", { error: error.message }))
    }
}

export default {
    config,
    langData,
    onCall
}
