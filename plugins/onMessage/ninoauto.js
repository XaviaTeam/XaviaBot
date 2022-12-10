const langData = {
    "en_US": {
        "noResult": "Nino doesn't understand what you're saying :("
    },
    "vi_VN": {
        "noResult": "Nino không hiểu bạn đang nói gì :("
    },
    "ar_SY": {
        "noResult": "نينو لا تفهم ما تقول :("
    }
}

const onCall = ({ message, getLang, data }) => {
    if (message.senderID == global.botID) return;
    if (!global.nino.hasOwnProperty(message.threadID) && !global.nino[message.threadID]) return;
    if (message.body.startsWith(`${data?.thread?.data?.prefix || global.config.PREFIX}nino off`)) return;

    global
        .GET(`${global.xva_api.main}/nino/get?key=${encodeURIComponent(message.body)}`)
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
            console.error(err);
        });
}

export default {
    langData,
    onCall
}
