const config = {
    name: "nino",
    description: "talk with nino",
    usage: "[text]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "en_US": {
        "missingInput": "Please enter the content you want to chat with Nino",
        "noResult": "Nino doesn't understand what you're saying :(",
        "error": "An error occurred, please try again later"
    },
    "vi_VN": {
        "missingInput": "Vui lòng nhập nội dung cần trò chuyện với Nino",
        "noResult": "Nino không hiểu bạn đang nói gì :(",
        "error": "Có lỗi xảy ra, vui lòng thử lại sau"
    },
    "ar_SY": {
        "missingInput": "الرجاء إدخال المحتوى الذي تريد الدردشة مع نينو",
        "noResult": "نينو لا تفهم ما تقول :(",
        "error": "لقد حدث خطأ، رجاء أعد المحاولة لاحقا"
    }
}

async function onCall({ message, args, getLang }) {
    const input = args.join(" ");
    if (!input) return message.reply(getLang("missingInput"));

    global
        .GET(`${global.xva_api.main}/nino/get?key=${encodeURIComponent(input)}`)
        .then((res) => {
            const { data } = res;
            const { status } = data;

            if (status == 1) {
                return message.reply(data.reply);
            } else {
                return message.reply(getLang("noResult"));
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
