'use strict';
export const config = {
    name: "Example",
    nsfw: ["hentai"],
    description: {
        "about": "Image Provider",
        "commands": {
            "anime": "Anime Image by tag",
            "hentai": "Hentai Image by tag",
        }
    },
    usage: {
        "anime": "[tag]",
        "hentai": "[tag]"
    },
    credits: "Xavia",
    permissions: [0, 1, 2],
    map: {
        "anime": sfw,
        "hentai": nsfw
    },
    dependencies: [
        "axios",
    ],
    cooldown: {
        "anime": 5,
        "hentai": 5
    }
}

function Anime( api, event, args, type ) {
    const nekoDomain = 'https://nekos.life/api/v2';
    const { threadID, messageID } = event;
    const { sfw, nsfw } = client.data;
    const key = args[0];
    if (!key) {
        api.sendMessage("Please provide a tag", threadID, messageID);
        return;
    }
    const data = type == "sfw" ? sfw : nsfw;
    if (!data.hasOwnProperty(key)) {
        return api.sendMessage(`Tag not found\nAvailable tags:\n${Object.keys(data).join(', ')}`, threadID, messageID);
    }
    const requestURL = nekoDomain + data[key];
    get(requestURL)
        .then(async (res) => {
            const { url } = res.data;
            try {
                const imageStream = (await get(url, { responseType: 'stream' })).data;
                const msg = {
                    body: `Link: ${url}`,
                    attachment: imageStream,
                }
                api.sendMessage(msg, threadID, messageID);
            } catch (err) {
                console.log(err);
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function sfw({api, event, args}) {
    Anime(api, event, args, "sfw");
}

function nsfw({api, event, args}) {
    Anime(api, event, args, "nsfw");
}

export function onLoad() {
    get('https://raw.githubusercontent.com/RFS-ADRENO/anime-from-neko/main/nsfw.json')
        .then(res => {
            client.data.nsfw = res.data;
        })
        .catch(err => {
            console.log(err);
        })
    get('https://raw.githubusercontent.com/RFS-ADRENO/anime-from-neko/main/sfw.json')
        .then(res => {
            client.data.sfw = res.data;
        })
        .catch(err => {
            console.log(err);
        })
}
