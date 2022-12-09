import ffmpegPath from "ffmpeg-static"
// import fluent from "fluent-ffmpeg"
import ytdl from "ytdl-core"
import { join } from "path";
import { statSync } from "fs";
import ytapi from "youtube-search-without-api-key";

const _48MB = 48 * 1024 * 1024;

const config = {
    name: "video",
    aliases: ['play', 'yt2mp4'],
    description: "Play a video from youtube",
    usage: '<keyword/url>',
    cooldown: 30,
    credits: "XaviaTeam",
    extra: {
        "MAX_VIDEOS": 6
    }
}

const langData = {
    "en_US": {
        "video.missingArguement": "Please provide keyword or an url",
        "video.noResult": "No result found",
        "video.invalidUrl": "Invalid url",
        "video.invaldIndex": "Invalid index",
        "video.tooLarge": "Video is too large, max size is 48MB",
        "video.error": "An error occured"
    },
    "vi_VN": {
        "video.missingArguement": "Vui lòng cung cấp từ khóa hoặc một url",
        "video.noResult": "Không tìm thấy kết quả",
        "video.invalidUrl": "Url không hợp lệ",
        "video.invaldIndex": "Số thứ tự không hợp lệ",
        "video.tooLarge": "Video quá lớn, tối đa 48MB",
        "video.error": "Đã xảy ra lỗi"
    }
}

// function onLoad() {
//     fluent.setFfmpegPath(ffmpegPath);
// }

async function playVideo(message, video, getLang) {
    const { title, id } = video;
    message.react("⏳");
    const cachePath = join(global.cachePath, `_ytvideo${Date.now()}.mp4`);
    try {
        let stream = ytdl(id, { quality: 18 });
        stream.pipe(global.writer(cachePath));
        await new Promise((resolve, reject) => {
            stream.on("end", resolve);
            stream.on("error", reject);
        });

        const stat = statSync(cachePath);
        if (stat.size > _48MB) {
            message.reply(getLang("video.tooLarge"));
        } else await message.reply({
            body: `[ ${title} ]`,
            attachment: global.reader(cachePath)
        });
        message.react("✅");
    } catch (err) {
        message.react("❌");
        console.error(err);
        message.reply(getLang("video.error"));
    }

    if (global.isExists(cachePath)) global.deleteFile(cachePath);
}

async function chooseVideo({ message, eventData, getLang }) {
    const { videos } = eventData;

    const index = parseInt(message.body) - 1;
    if (isNaN(index) || index < 0 || index >= videos.length) return message.reply(getLang("video.invaldIndex"));

    const video = videos[index];

    try {
        await playVideo(message, video, getLang);
    } catch (err) {
        throw err;
    }
}

async function getVideoInfo(id) {
    try {
        const data = await ytapi.search(id);
        return data[0] || null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function searchByKeyword(keyword, MAX_VIDEOS) {
    try {
        if (!keyword) return [];
        let data = await ytapi.search(keyword);
        if (!data) return [];
        return data.slice(0, MAX_VIDEOS);

    } catch (err) {
        throw err;
    }
}

async function downloadThumbnails(urls) {
    try {
        const attachments = [];
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            if (!url) continue;
            const path = join(global.cachePath, `_ytvideo${Date.now()}.jpg`);
            await global.downloadFile(path, url);

            attachments.push(path);
        }

        return attachments;
    } catch (err) {
        throw err;
    }
}

async function onCall({ message, args, extra, getLang }) {
    try {
        if (!args[0]) return message.reply(getLang("video.missingArguement"));
        let url = args[0];
        if (!url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
            let data = await searchByKeyword(url, extra.MAX_VIDEOS);
            if (!data[0]) return message.reply(getLang("video.noResult"));
            const items = data;
            const videos = [], attachments = [];

            for (let i = 0; i < items.length; i++) {
                if (!items[i]) break;
                const id = items[i].id.videoId;
                const info = await getVideoInfo(id);
                if (!info) continue;

                const duration = info.snippet.duration;
                videos.push({
                    id: id,
                    title: info.snippet.title,
                    duration: duration
                });
            }

            const thumbnails = await downloadThumbnails(items.map(item => item.snippet.thumbnails.high.url));

            attachments.push(
                ...(thumbnails || [])
                    .map(path => global.reader(path))
            );

            if (!videos.length) return message.reply(getLang("video.noResult"));

            const sendData = await message.reply({
                body: videos.map((video, index) => `${index + 1}. ${video.title} (${video.duration})`).join("\n\n"),
                attachment: attachments
            });

            for (let i = 0; i < thumbnails.length; i++) {
                if (global.isExists(thumbnails[i])) global.deleteFile(thumbnails[i]);
            }

            return sendData.addReplyEvent({ callback: chooseVideo, videos });
        }

        const id = url.match(/(?:http(?:s):\/\/)?(?:www.|m.)?(?:youtu(?:be|.be))?(?:\.com)\/?(?:watch\?v=(?=\w.*))?([\w\.-]+)/)?.[1];
        if (!id) return message.reply(getLang("video.invalidUrl"));
        let info = await getVideoInfo(id);
        if (!info) return message.reply(getLang("video.noResult"));
        const video = {
            title: info.snippet.title,
            id
        }

        await playVideo(message, video, getLang);
    } catch (err) {
        console.error(err);
        message.reply(getLang("video.error"));
    }
}

export default {
    config,
    langData,
    // onLoad,
    onCall
}
