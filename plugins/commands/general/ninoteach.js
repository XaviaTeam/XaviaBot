const config = {
    name: "ninoteach",
    aliases: ["teach"],
    description: "Teach Nino",
    usage: "[text] => [reply]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam",
}

const langData = {
    "en_US": {
        "wrongSyntax": "Wrong syntax, please try again",
        "missingInput": "Missing input!",
        "succeed": "Teach succeed!",
        "failed": "Teach failed!",
        "error": "An error occurred, please try again later"
    },
    "vi_VN": {
        "wrongSyntax": "Sai cú pháp, vui lòng thử lại",
        "missingInput": "Thiếu dữ kiện!",
        "succeed": "Dạy thành công!",
        "failed": "Dạy thất bại!",
        "error": "Có lỗi xảy ra, vui lòng thử lại sau"
    },
    "ar_SY": {
        "wrongSyntax": "بناء جملة خاطئ ، يرجى المحاولة مرة أخرى",
        "missingInput": "بيانات مفقودة!",
        "succeed": "نجح التدريس!",
        "failed": "فشل التدريس!",
        "error": "لقد حدث خطأ، رجاء أعد المحاولة لاحقا"
    }
}

async function onCall({ message, args, getLang }) {
    const arrow = args.indexOf("=>");
    if (arrow == -1) return message.reply(getLang("wrongSyntax"));


    const key = args.slice(0, arrow).join(" ");
    const value = args.slice(arrow + 1).join(" ");

    if (!key || !value) return message.reply(getLang("missingInput"));
    global
        .GET(`${global.xva_api.main}/nino/add?key=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}`)
        .then((res) => {
            const { data } = res;
            const { status } = data;

            if (status == 0 || status == 1) {
                return message.reply(getLang("succeed"));
            } else {
                return message.reply(getLang("failed"));
            }
        })
        .catch((err) => {
            return message.reply(getLang("error"));
        });
}

export default {
    config,
    langData,
    onCall
}
