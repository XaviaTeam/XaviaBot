import wiki from 'wikijs'

const config = {
    name: "wiki",
    description: "search on wikipedia",
    usage: "[keyword]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "en_US": {
        "missingInput": "Missing input!",
        "noResult": "No result found!",
        "error": "An error occurred, please try again later"
    },
    "vi_VN": {
        "missingInput": "Thiếu dữ kiện!",
        "noResult": "Không tìm thấy kết quả!",
        "error": "Có lỗi xảy ra, vui lòng thử lại sau"
    },
    "ar_SY": {
        "missingInput": "بيانات مفقودة!",
        "noResult": "لم يتم العثور على نتائج!",
        "error": "لقد حدث خطأ، رجاء أعد المحاولة لاحقا"
    }
}

const supportedLanguages = ["en_US", "vi_VN", "ar_SY"];

function getSystemLanguage() {
    if (supportedLanguages.includes(global.config.LANGUAGE)) {
        return global.config.LANGUAGE;
    } else {
        return "en_US";
    }
}

async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
    const input = args.join(" ");
    if (!input) return message.reply(getLang("missingInput"));

    wiki.default({ apiUrl: `https://${getSystemLanguage().split("_")[0]}.wikipedia.org/w/api.php` })
        .find(input)
        .then(async (page) => {
            try {
                const summary = await page.summary();

                await message.reply(summary);
            } catch (error) {
                return message.reply(getLang("noResult"));
            }
        })
        .catch((err) => {
            console.error(err);
            message.reply(getLang("error"));
        });
}

export default {
    config,
    langData,
    onCall
}
