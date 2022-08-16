export const info = {
    name: "Youtube",
    about: "Youtube Commands",
    credits: "Xavia",
    dependencies: ["ytdl-core", "@ffmpeg-installer/ffmpeg", "fluent-ffmpeg"],
    extra: {
        ytdl: {
            ffmpeg: {
                audioEncode: "aac"
            },
            fast_run: false
        }
    }
}

export const langData = {
    "en_US": {
        "ytdl.noURL": "Please provide valid URL!",
        "ytdl.noType": "Please provide valid type: video, audio",
        "ytdl.overSize": "File size is over 25MB",
        "any.error": "An error occured!"
    },
    "vi_VN": {
        "ytdl.noURL": "Vui lòng cung cấp đường dẫn hợp lệ!",
        "ytdl.noType": "Vui lòng cung cấp loại hợp lệ: video, audio",
        "ytdl.overSize": "Tệp quá lớn, không thể tải lên!",
        "any.error": "ĐÃ có lỗi xảy ra!"
    }
}

function ytdl() {
    const config = {
        name: "ytdl",
        aliases: ["youtubedl"],
        version: "1.0.0",
        description: "download youtube vidoe/audio",
        usage: "[videoURL]",
        permissions: 2,
        cooldown: 5
    }

    const ytdl = libs["ytdl-core"];
    const ffmpeg = libs["fluent-ffmpeg"];

    ffmpeg.setFfmpegPath(libs["@ffmpeg-installer/ffmpeg"].path);
    const _25MB = 25 * 1024 * 1024;
    const onCall = async ({ message, args, getLang }) => {
        const URL = args[0];
        const { reply, senderID } = message;
        const yt_regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.?be)\/.+/g;
        try {
            if (!yt_regex.test(URL)) {
                reply(getLang("ytdl.noURL"));
            } else {
                let dl_type = args[1]?.toLowerCase();
                if (dl_type !== "video" && dl_type !== "audio" && dl_type !== "-v" && dl_type !== "-a") {
                    reply(getLang("ytdl.noType"));
                } else {
                    dl_type = dl_type === "-v" || dl_type === "video" ? "video" : "audio";

                    const ext = dl_type == 'video' ? 'mp4' : 'aac';
                    const path = `${client.mainPath}/plugins/cache/ytdl_${Date.now()}_${senderID}.${ext}`;
                    const ytdlOptions = dl_type == 'video' ? { quality: '18' } : { filter: 'audioonly' };
                    let stream = ytdl(URL, ytdlOptions);


                    if (client.configPlugins[info.name]["ytdl"]["fast_run"] || dl_type === 'video') {
                        const _writer = writer(path);
                        stream
                            .pipe(_writer)
                            .on('error', async (err) => {
                                _writer.destroy();
                                console.error(err);
                                if (isExists(path)) await deleteFile(path);
                                reply(getLang("any.error"));
                            })
                            .on('finish', async () => {
                                console.log('finished');
                                const stats = fileStats(path);
                                if (stats.size > _25MB) {
                                    reply(getLang("ytdl.overSize"));
                                } else {
                                    const _reader = reader(path);
                                    await reply({ attachment: _reader });
                                    _reader.destroy();
                                }

                                await deleteFile(path);
                                _writer.destroy();
                            })
                    } else {
                        const audioEncode = client.configPlugins[info.name]["ytdl"]["ffmpeg"]["audioEncode"] || "aac";
                        ffmpeg(stream)
                            .audioCodec(audioEncode)
                            .save(path)
                            .on('error', async (err) => {
                                console.error(err);
                                if (isExists(path)) await deleteFile(path);
                                reply(getLang("any.error"));
                            })
                            .on('end', async () => {
                                const stats = fileStats(path);
                                if (stats.size > _25MB) {
                                    reply(getLang("ytdl.overSize"));
                                } else {
                                    const _reader = reader(path);
                                    await reply({ attachment: _reader });
                                    _reader.destroy();
                                }

                                await deleteFile(path);
                            });
                    }
                }
            }
        } catch (error) {
            console.error(error);
            reply(getLang("any.error"));
        }

        return;
    }

    return { config, onCall };
}


export const scripts = {
    commands: {
        ytdl
    }
}
