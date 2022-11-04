import ffmpegPath from "ffmpeg-static"
import fluent from "fluent-ffmpeg"
import ytdl from "ytdl-core"
import { join } from "path";
import { statSync } from "fs";

const _48MB = 48 * 1024 * 1024;

const config = {
    name: "video",
    aliases: ['play', 'yt2mp4'],
    description: "Play a video from youtube",
    usage: '<keyword/url>',
    cooldown: 5,
    credits: "XaviaTeam",
    extra: {
        "API_KEY": "AIzaSyAcRx-0oTSCTgcCpzL5rTtG3IKoXl2HJyk",
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

function onLoad() {
    fluent.setFfmpegPath(ffmpegPath);
}

async function playVideo(message, video, getLang) {
    const { title, url } = video;
    message.react("⏳");
    const cachePath = join(global.cachePath, `${title}${Date.now()}.mp4`);
    try {
        let stream = ytdl(url, { quality: 18 });
        await new Promise((resolve, reject) => {
            fluent(stream)
                .save(cachePath)
                .on('end', () => {
                    resolve();
                })
                .on('error', (err) => {
                    reject(err);
                })
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

function formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);

    return `${hours ? hours + ":" : ""}${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

async function getVideoInfo(id, API_KEY) {
    try {
        let res = await global.GET(`https://www.googleapis.com/youtube/v3/videos?part=snippet&part=contentDetails&id=${id}&key=${API_KEY}`);
        return res.data.items[0] || null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function onCall({ message, args, extra, getLang }) {
    try {
        if (!args[0]) return message.reply(getLang("video.missingArguement"));
        let url = args[0];
        if (!url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
            let res = await global.GET(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(args.join(" "))}&key=${extra.API_KEY}&maxResults=${extra.MAX_VIDEOS}`);
            if (!res.data.items[0]) return message.reply("No result found");
            const items = res.data.items;
            const videos = [], attachments = [];

            for (let i = 0; i < extra.MAX_VIDEOS; i++) {
                if (!items[i]) break;
                const id = items[i].id.videoId;
                const info = await getVideoInfo(id, extra.API_KEY);
                if (!info) continue;
                const duration = info.contentDetails.duration;
                videos.push({
                    url: `https://www.youtube.com/watch?v=${id}`,
                    title: info.snippet.title,
                    duration: formatDuration(duration)
                });

                attachments.push(await global.getStream(info.snippet.thumbnails.high.url));
            }
            if (!videos.length) return message.reply(getLang("video.noResult"));

            const sendData = await message.reply({
                body: videos.map((video, index) => `${index + 1}. ${video.title} (${video.duration})`).join("\n\n"),
                attachment: attachments
            });

            return sendData.addReplyEvent({ callback: chooseVideo, videos });
        }

        const id = url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)[0].split("v=")[1].split("&")[0];
        if (!id) return message.reply(getLang("video.invalidUrl"));
        let info = await getVideoInfo(id, extra.API_KEY);
        if (!info) return message.reply(getLang("video.noResult"));
        const video = {
            title: info.snippet.title,
            url: `https://www.youtube.com/watch?v=${info.id}`
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
    onLoad,
    onCall
}
