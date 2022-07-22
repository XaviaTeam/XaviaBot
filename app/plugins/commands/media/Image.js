export const info = {
    name: "Image",
    about: "Image Provider",
    credits: "Xavia",
    onLoad
}

export const langData = {
    "en_US": {
        "anime.error.missingTag": "Please provide a tag",
        "anime.error.tagNotFound": "Tag not found, available tags:\n\n{tags}",
        "anime.description": "Get an anime image from nekos.life",
        // "hentai.description": "Get a hentai image from nekos.life",
        "any.error.noImage": "An error occured, please try again later"
    },
    "vi_VN": {
        "anime.error.missingTag": "Vui lòng cung cấp một thẻ",
        "anime.error.tagNotFound": "Thẻ không hợp lệ, các thẻ hiện có:\n\n{tags}",
        "anime.description": "Ảnh anime từ nekos.life",
        // "hentai.description": "ẢNh hentai từ nekos.life",
        "any.error.noImage": "Đã có lỗi xảy ra, vui lòng thử lại"
    }
}

function onLoad() {
    // GET('https://raw.githubusercontent.com/RFS-ADRENO/anime-from-neko/main/nsfw.json')
    //     .then(res => {
    //         client.data.nsfw = res.data;
    //     })
    //     .catch(err => {
    //         console.error(err);
    //     })
    GET('https://raw.githubusercontent.com/RFS-ADRENO/anime-from-neko/main/sfw.json')
        .then(res => {
            client.data.sfw = res.data;
        })
        .catch(err => {
            console.error(err);
        })
}


function Anime(message, args, getLang, type) {
    const nekoDomain = 'https://nekos.life/api/v2';
    const { reply } = message;
    const { sfw, nsfw } = client.data;
    const key = args[0];
    if (!key) {
        reply(getLang('anime.error.missingTag'));
    } else {
        const data = type == "sfw" ? sfw : nsfw;
        if (!data.hasOwnProperty(key)) {
            reply(getLang('anime.error.tagNotFound', { tags: Object.keys(data).join(', ') }));
        } else {
            const requestURL = nekoDomain + data[key];
            GET(requestURL)
                .then(async (res) => {
                    const { url } = res.data;
                    if (!url) reply(getLang('any.error.noImage'));
                    try {
                        const imageStream = await getStream(url);
                        const msg = {
                            body: `Link: ${url}`,
                            attachment: imageStream,
                        }
                        reply(msg);
                    } catch (err) {
                        console.error(err);
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }

    return;
}

function anime() {
    const config = {
        name: "anime",
        aliases: [],
        description: getLang("anime.description", null, info.name),
        usage: '[tag]',
        permissions: 2,
        cooldown: 5
    }

    const onCall = ({ message, args, getLang }) => {
        Anime(message, args, getLang, "sfw");
    }

    return { config, onCall };
}


// function hentai() {
//     const config = {
//         name: "hentai",
//         aliases: ["hent"],
//         description: getLang("hentai.description", null, info.name),
//         usage: '[tag]',
//         permissions: 2,
//         cooldown: 5,
//         nsfw: true
//     }

//     const onCall = ({ message, args, getLang }) => {
//         Anime(message, args, getLang, "nsfw");
//     }

//     return { config, onCall };
// }


export const scripts = {
    commands: {
        anime
    }
}
