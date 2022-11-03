const config = {
    name: "trans",
    aliases: ['translate', 'dich'],
    description: "Translate text to bot language.",
    usage: '[lang] [text]',
    credits: 'XaviaTeam'
}

const langData = {
    'en_US': {
        'trans.error.noText': 'Please enter the text you want to translate.',
        "trans.error.unknown": "An error occured",
        "trans.success": "{from} => {to}:\n{translation}"
    },
    'vi_VN': {
        "trans.error.noText": "Vui lòng nhập văn bản cần dịch.",
        "trans.error.unknown": "Đã xảy ra lỗi",
        "trans.success": "{from} => {to}:\n{translation}"
    }
}

const supportedLangs = ["sq", "af", "ar", "bn", "bs", "my", "ca", "hr", "cs", "da", "nl", "en", "et", "fil", "fi", "fr", "de", "el", "gu", "hi", "hu", "is", "id", "it", "ja", "kn", "km", "ko", "la", "lv", "ml", "mr", "ne", "nb", "pl", "pt", "ro", "ru", "sr", "si", "sk", "es", "sw", "sv", "ta", "te", "th", "tr", "uk", "ur", "vi"];

function onCall({ message, args, getLang }) {
    const { reply, type } = message;

    const lang_config = global.config.LANGUAGE.slice(0, 2);
    const lang_to = supportedLangs.includes(lang_config) ? lang_config : 'vi';
    const lang_from = supportedLangs.includes(args[0]?.toLowerCase()) ? args.shift()?.toLowerCase() : 'en';
    const text = type == "message_reply" ? message.messageReply.body : args.join(' ');

    if (!text) return reply(getLang('trans.error.noText'));

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${lang_from}&tl=${lang_to}&dt=t&q=${encodeURIComponent(text)}`;
    GET(url)
        .then(res => {
            const translation = res.data[0][0][0];
            reply(getLang('trans.success', { from: lang_from, to: lang_to, translation }));
        })
        .catch(err => {
            console.error(err);
            reply(getLang('trans.error.unknown'));
        });

    return;
}

export default {
    config,
    langData,
    onCall
}
