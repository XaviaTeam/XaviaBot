'use strict';
export const config = {
    name: "Image",
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

export const langData = {
    "en_US": {
        "anime.error.missingTag": "Please provide a tag",
        "anime.error.tagNotFound": "Tag not found, available tags:\n\n{tags}"
    },
    "vi_VN": {
        "anime.error.missingTag": "Vui lòng cung cấp một thẻ",
        "anime.error.tagNotFound": "Thẻ không hợp lệ, các thẻ hiện có:\n\n{tags}"
    }
}

function Anime(api, event, args, getLang, type) {
    const nekoDomain = 'https://nekos.life/api/v2';
    const { threadID, messageID } = event;
    const { sfw, nsfw } = client.data;
    const key = args[0];
    if (!key) {
        api.sendMessage(getLang('anime.error.missingTag'), threadID, messageID);
    } else {
        const data = type == "sfw" ? sfw : nsfw;
        if (!data.hasOwnProperty(key)) {
            api.sendMessage(getLang('anime.error.tagNotFound', { tags: Object.keys(data).join(', ') }), threadID, messageID);
        } else {
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
    }

    return;
}

function sfw({ api, event, args, getLang }) {
    Anime(api, event, args, getLang, "sfw");
}

function nsfw({ api, event, args, getLang }) {
    Anime(api, event, args, getLang, "nsfw");
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
