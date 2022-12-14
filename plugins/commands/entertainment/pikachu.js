const config = {
    name: "pikachu",
    description: "pikachu meme maker",
    usage: "[text]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "vi_VN": {
        "missingInput": "Bạn chưa nhập dữ liệu",
        "error": "Có lỗi xảy ra, vui lòng thử lại sau"
    },
    "en_US": {
        "missingInput": "You haven't entered any text",
        "error": "An error occurred, please try again later"
    },
    "ar_SY": {
        "missingInput": "لم تدخل أي نص",
        "error": "لقد حدث خطأ، رجاء أعد المحاولة لاحقا"
    }
}

async function onCall({ message, args, getLang }) {
    const input = args.join(" ");
    if (input.length == 0) return message.reply(getLang("missingInput"));

    global
        .getStream(`${global.xva_api.popcat}/pikachu?text=${encodeURIComponent(input)}`)
        .then(stream => {
            message.reply({ attachment: stream });
        })
        .catch(err => {
            console.error(err);
            message.reply(getLang("error"));
        })
}

export default {
    config,
    langData,
    onCall
}
