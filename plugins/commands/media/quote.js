const config = {
    name: "quote",
    description: "Anime Quotes!",
    usage: "[character]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "en_US": {
        "noResults": "No results found...",
        "results": "• Anime: {anime}\n• Character: {character}\n• Quote: \"{quote}\"",
        "error": "Error, try again later."
    },
    "vi_VN": {
        "noResults": "Không tìm thấy kết quả nào",
        "results": "• Anime: {anime}\n• Nhân vật: {character}\n• Quote: \"{quote}\"",
        "error": "Đã có lỗi xảy ra..."
    }
}

const url = "https://animechan.vercel.app/api/random";

async function onCall({ message, args, getLang }) {
    try {
        let requestURL = url;
        const input = args.join(" ");
        if (input) {
            requestURL += `/character?name=${input}`;
        }

        const response = await global.GET(requestURL);
        const data = response.data;

        if (data.error) return message.reply(getLang("noResults"));
        await message.reply(getLang("results", {
            anime: data.anime,
            character: data.character,
            quote: data.quote
        }))
    } catch (e) {
        console.error(e);
        message.reply(getLang("error"))
    }
}

export default {
    config,
    langData,
    onCall
}
