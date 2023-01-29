const config = {
    name: "pooh",
    description: "pooh meme maker",
    usage: "[text1] | [text2]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "vi_VN": {
        "missingInput": "Bạn chưa nhập dữ liệu",
        "missingInput2": "Bạn chưa nhập dữ liệu thứ 2",
        "error": "Có lỗi xảy ra, vui lòng thử lại sau"
    },
    "en_US": {
        "missingInput": "You haven't entered any text",
        "missingInput2": "Missing second input",
        "error": "An error occurred, please try again later"
    },
    "ar_SY": {
        "missingInput": "لم تدخل أي نص",
        "missingInput2": "الإدخال الثاني مفقود",
        "error": "لقد حدث خطأ، رجاء أعد المحاولة لاحقا"
    }
}

async function onCall({ message, args, getLang }) {
    const input = args.join(" ");
    if (input.length == 0) return message.reply(getLang("missingInput"));

    const text1 = input.split("|")[0];
    const text2 = input.split("|")[1];

    if (!text2) return message.reply(getLang("missingInput2"));

    const path = `${global.cachePath}/pooh_${message.senderID}_${Date.now()}.png`;
    const clean = () => {
        try {
            if (global.isExists(path)) global.deleteFile(path);
        } catch (e) {
            console.error(e);
        }
    }

    global
        .downloadFile(path, `${global.xva_api.popcat}/pooh?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`)
        .then(async _ => {
            await message.reply({ attachment: global.reader(path) });
            clean();
        })
        .catch(err => {
            clean();
            console.error(err);
            message.reply(getLang("error"));
        })
}

export default {
    config,
    langData,
    onCall
}
