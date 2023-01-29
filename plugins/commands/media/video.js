import ytdl from "ytdl-core"
import { join } from "path";
import { statSync } from "fs";

const _48MB = 48 * 1024 * 1024;

const config = {
    name: "video",
    aliases: ['play', 'yt2mp4'],
    version: "1.0.3",
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
    },
    "ar_SY": {
        "video.missingArguement": "يرجى تقديم كلمة رئيسية أو عنوان الرابط",
        "video.noResult": "لم يتم العثور على نتائج",
        "video.invalidUrl": "الرابط غير صالح",
        "video.invaldIndex": "فهرس غير صالح",
        "video.tooLarge": "الفيديو كبير جدًا ، الحد الأقصى للحجم هو 48 ميجا بايت",
        "video.error": "حدث خطأ"
    }
}

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

    try {
        if (global.isExists(cachePath)) global.deleteFile(cachePath);
    } catch (err) {
        console.error(err);
    }
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

function formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);

    return `${hours ? hours + ":" : ""}${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

async function getVideoInfo(id) {
    try {
        const { data } = await global.GET(`${global.xva_api.main}/ytvideodetails?id=${id}`)
        return data.result[0] || null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function searchByKeyword(keyword, MAX_VIDEOS) {
    try {
        if (!keyword) return [];
        const { data } = await global.GET(`${global.xva_api.main}/ytsearch?keyword=${encodeURIComponent(keyword)}&maxResults=${MAX_VIDEOS}`);
        if (!data?.result) return [];
        return data.result;

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
            let data = await searchByKeyword(args.join(" "), extra.MAX_VIDEOS);
            if (!data[0]) return message.reply(getLang("video.noResult"));
            const items = data;
            const videos = [], attachments = [];

            for (let i = 0; i < items.length; i++) {
                if (!items[i]) break;
                const id = items[i].id.videoId;
                const info = await getVideoInfo(id);
                if (!info) continue;

                const duration = info.contentDetails.duration;
                videos.push({
                    id: id,
                    title: info.snippet.title,
                    duration: formatDuration(duration)
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
                try {
                    if (global.isExists(thumbnails[i])) global.deleteFile(thumbnails[i]);
                } catch (err) {
                    console.error(err);
                }
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
    onCall
}
