import { statSync } from 'fs';
import { join } from 'path';

const _48MB = 48 * 1024 * 1024;

const config = {
    name: "tikvideo",
    aliases: ["tik", "tikdown", "tikdl"],
    description: "Download video tiktok no watermark.",
    usage: "[url]",
    credits: "XaviaTeam",
    cooldown: 5,
    extra: {
        rapidAPIKeys: [
            "307bec2bcbmshb748ecfe938742dp165710jsn576aac0d5843",
            "256a5a82f6mshdec61968b0afa44p1ff6bejsne9f274912652",
            "606f44b183msh2cf82a0144d56d7p19e4edjsn94959b3daa51"
        ]
    }
}

const langData = {
    "en_US": {
        "missingUrl": "Please provide a url",
        "fileTooLarge": "File is too large, max size is 48MB",
        "error": "An error occured"
    },
    "vi_VN": {
        "missingUrl": "Vui lòng cung cấp một url",
        "fileTooLarge": "File quá lớn, tối đa 48MB",
        "error": "Đã xảy ra lỗi"
    }
}

async function getVideoURL(url, keys) {
    const options = {
        params: { link: url },
        headers: {
            'X-RapidAPI-Key': keys[global.random(0, keys.length - 1)],
            'X-RapidAPI-Host': 'tiktok-downloader-download-videos-without-watermark1.p.rapidapi.com'
        }
    };

    try {
        const res = await global
            .GET('https://tiktok-downloader-download-videos-without-watermark1.p.rapidapi.com/media-info/', options);

        return { videoUrl: res.data.result.video.url_list[0] || null, desc: res.data.result.aweme_detail.desc || null };
    } catch (e) {
        console.error(e);
        return null;
    }

}

async function onCall({ message, args, getLang }) {
    let cachePath;
    try {
        if (!args[0]) return message.reply(getLang('missingUrl'));
        const url = args[0];

        message.react("✅");
        const { videoUrl, desc } = await getVideoURL(url, config.extra.rapidAPIKeys);
        if (!videoUrl) return message.reply(getLang('error'));

        cachePath = join(global.cachePath, `${desc}${Date.now()}.mp4`);

        await global.downloadFile(cachePath, videoUrl);
        const fileStat = statSync(cachePath);
        if (fileStat.size > _48MB) message.reply(getLang('fileTooLarge'));
        else await message.reply({
            body: desc,
            attachment: global.reader(cachePath)
        });
    } catch (e) {
        message.react("❌");
        console.error(e);
        message.reply(getLang('error'));
    }

    if (global.isExists(cachePath)) global.deleteFile(cachePath);
}

export default {
    config,
    langData,
    onCall
}
