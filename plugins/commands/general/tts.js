const config = {
    name: "say",
    aliases: ["tts", "talk", "speak"],
    description: "Text to speech",
    usage: '[text]',
    credits: "XaviaTeam"
}

const langData = {
    "en_US": {
        "say.error.noText": "Please enter text"
    },
    "vi_VN": {
        "say.error.noText": "Vui lòng nhập văn bản"
    },
    "ar_SY": {
        "say.error.noText": "الرجاء إدخال النص"
    }
}

const supportedLangs = ["sq", "af", "ar", "bn", "bs", "my", "ca", "hr", "cs", "da", "nl", "en", "et", "fil", "fi", "fr", "de", "el", "gu", "hi", "hu", "is", "id", "it", "ja", "kn", "km", "ko", "la", "lv", "ml", "mr", "ne", "nb", "pl", "pt", "ro", "ru", "sr", "si", "sk", "es", "sw", "sv", "ta", "te", "th", "tr", "uk", "ur", "vi"];

function onCall({ message, args, getLang }) {
    const { reply } = message;
    let lang, text;
    if (args.length == 0) {
        reply(getLang("say.error.noText"));
    } else {
        if (args.length > 1) {
            lang = args[0];
            text = [...args].slice(1).join(' ');
            if (!supportedLangs.includes(lang)) {
                lang = "vi";
                text = args.join(' ');
            }
        } else {
            lang = "vi";
            text = args[0];
        }

        getStream(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`)
            .then(stream => {
                reply({ attachment: stream });
            })
            .catch(err => {
                console.error(err);
                reply("Error");
            })
    }

    return;
}

export default {
    config,
    langData,
    onCall
}
