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

const onLoad = () => {
    if (!global.hasOwnProperty("ninoauto")) global.ninoauto = {};
}

const _3Sec = 3000;

const onCall = ({ message, getLang, data }) => {
    const { senderID, threadID } = message;

    if (senderID == global.botID) return;
    if (!global.nino.hasOwnProperty(threadID) && !global.nino[threadID]) return;
    if (message.body.startsWith(`${data?.thread?.data?.prefix || global.config.PREFIX}nino off`)) return;

    if (!global.ninoauto.hasOwnProperty(message.threadID)) global.ninoauto[threadID] = {};
    if (!global.ninoauto[threadID].hasOwnProperty(senderID)) global.ninoauto[threadID][senderID] = 0;

    if (global.ninoauto[threadID][senderID] + _3Sec > Date.now()) return;
    global.ninoauto[threadID][senderID] = Date.now();

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
    onLoad,
    langData,
    onCall
}
