import ffmpegPath from "ffmpeg-static"
import fluent from "fluent-ffmpeg"
import ytdl from "ytdl-core"
import { join } from "path";

const config = {
    name: "audio",
    aliases: ['yt2mp3', 'sing'],
    description: "Play music from youtube",
    usage: '<keyword/url>',
    cooldown: 5,
    credits: "XaviaTeam",
    extra: {
        "API_KEY": "AIzaSyAcRx-0oTSCTgcCpzL5rTtG3IKoXl2HJyk",
        "MAX_SONGS": 6
    }
}

const langData = {
    "en_US": {
        "audio.missingArguement": "Please provide keyword or an url",
        "audio.noResult": "No result found",
        "audio.invalidUrl": "Invalid url",
        "audio.invaldIndex": "Invalid index",
        "audio.error": "An error occured"
    },
    "vi_VN": {
        "audio.missingArguement": "Vui lòng cung cấp từ khóa hoặc một url",
        "audio.noResult": "Không tìm thấy kết quả",
        "audio.invalidUrl": "Url không hợp lệ",
        "audio.invaldIndex": "Số thứ tự không hợp lệ",
        "audio.error": "Đã xảy ra lỗi"
    }
}

function onLoad() {
    fluent.setFfmpegPath(ffmpegPath);
}

async function playMusic(message, song, getLang) {
    const { title, url } = song;
    message.react("⏳");
    const cachePath = join(global.cachePath, `${title}${Date.now()}.mp3`);
    try {
        let stream = ytdl(url, { quality: 'lowestaudio' });
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

        await message.reply({
            body: `[ ${title} ]`,
            attachment: global.reader(cachePath)
        });
        message.react("✅");
    } catch (err) {
        message.react("❌");
        console.error(err);
        message.reply(getLang("audio.error"));
    }

    if (global.isExists(cachePath)) global.deleteFile(cachePath);
}

async function chooseSong({ message, eventData, getLang }) {
    const { songs } = eventData;

    const index = parseInt(message.body) - 1;
    if (isNaN(index) || index < 0 || index >= songs.length) return message.reply(getLang("audio.invalidIndex"));

    const song = songs[index];

    try {
        await playMusic(message, song, getLang);
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
        if (!args[0]) return message.reply(getLang("audio.missingArguement"));
        let url = args[0];
        if (!url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
            let res = await global.GET(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(args.join(" "))}&key=${extra.API_KEY}&maxResults=${extra.MAX_SONGS}`);
            if (!res.data.items[0]) return message.reply(getLang("audio.noResult"));
            const items = res.data.items;
            const songs = [], attachments = [];

            for (let i = 0; i < extra.MAX_SONGS; i++) {
                if (!items[i]) break;
                const id = items[i].id.videoId;
                const info = await getVideoInfo(id, extra.API_KEY);
                if (!info) continue;
                const duration = info.contentDetails.duration;
                songs.push({
                    url: `https://www.youtube.com/watch?v=${id}`,
                    title: info.snippet.title,
                    duration: formatDuration(duration)
                });

                attachments.push(await global.getStream(info.snippet.thumbnails.high.url));
            }
            if (!songs.length) return message.reply(getLang("audio.noResult"));

            const sendData = await message.reply({
                body: songs.map((song, index) => `${index + 1}. ${song.title} (${song.duration})`).join("\n\n"),
                attachment: attachments
            });

            return sendData.addReplyEvent({ callback: chooseSong, songs });
        }

        const id = url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)[0].split("v=")[1].split("&")[0];
        if (!id) return message.reply(getLang("audio.invalidUrl"));
        let info = await getVideoInfo(id, extra.API_KEY);
        if (!info) return message.reply(getLang("audio.noResult"));
        const song = {
            title: info.snippet.title,
            url: `https://www.youtube.com/watch?v=${info.id}`
        }

        await playMusic(message, song, getLang);
    } catch (err) {
        console.error(err);
        message.reply(getLang("audio.error"));
    }
}

export default {
    config,
    langData,
    onLoad,
    onCall
}
