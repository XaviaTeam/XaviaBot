import logger from "../../core/var/modules/logger.js";

/**
 *
 * @param {{ event: Extract<Parameters<TOnCallEvents>[0]["event"], { logMessageType: "log:thread-image" }> }} param0
 * @returns
 */
export default async function ({ event }) {
    const { api, utils } = global;
    const { threadID, author } = event;
    const { Threads, Users } = global.controllers;

    const getThread = await Threads.get(threadID);

    if (getThread == null) return;

    const getThreadData = getThread.data;
    const getThreadInfo = getThread.info;

    const oldImage = getThreadInfo.imageSrc || null;
    const isBot = author == botID;

    let reversed = false,
        alertMsg = null;

    if (
        getThreadData.antiSettings &&
        getThreadData.antiSettings.antiChangeGroupImage == true &&
        oldImage
    ) {
        const isReversing = global.data.temps.some(
            (i) => i.type == "antiChangeGroupImage" && i.threadID == threadID
        );

        if (!isBot && isReversing); // might bug
        if (!isBot && !isReversing) {
            global.data.temps.push({ type: "antiChangeGroupImage", threadID });

            try {
                const imagePath = utils.buildCachePath(
                    `${threadID}_${Date.now()}_oldImage.jpg`
                );
                let builtUrl = utils.buildURL(oldImage);
                if (builtUrl == null) {
                    // possible base64 image, deprecated
                    logger.warn(
                        global.getLang(
                            "plugins.events.change_thread_image.unsupported",
                            {
                                threadId: threadID,
                            }
                        )
                    );
                    // backwards compatibility, save base64 image to file and save path to database
                    const imgPath = join(global.tPath, `${threadID}.jpg`);
                    await utils.saveFromBase64(imgPath, oldImage);

                    getThreadData.imageSrc = imgPath;

                    builtUrl = utils.buildURL(oldImage);
                }

                const isLocal =
                    builtUrl.protocol != "http:" &&
                    builtUrl.protocol != "https:";
                if (!isLocal) {
                    await utils.downloadFile(imagePath, builtUrl.href);
                }

                await api.changeGroupImage(
                    reader(isLocal ? oldImage : imagePath),
                    threadID
                );

                reversed = true;

                const tempIndex = global.data.temps.findIndex((e) => {
                    return (
                        e.type == "antiChangeGroupImage" &&
                        e.threadID == threadID
                    );
                });

                if (tempIndex != -1) {
                    global.data.temps.splice(tempIndex, 1);
                }

                if (utils.isExists(imagePath, "file")) {
                    utils.deleteFile(imagePath);
                }
            } catch (err) {
                console.error(err);
            }
        }
    } else {
        const newImageURL = event.logMessageData.image.url;
        try {
            const imagePath = utils.buildCachePath(
                `${threadID}_${Date.now()}_oldImage.jpg`
            );

            let imgToSave = null;
            if (newImageURL != null) {
                if (process.env.IMGBB_KEY) {
                    imgToSave = await utils
                        .uploadImgbb(newImageURL)
                        .catch((e) => {
                            console.error(
                                e.stack || e.response?.body || e.message || e
                            );
                            return null;
                        });
                }

                if (!imgToSave) {
										const imgPath = join(global.tPath, `${threadID}.jpg`);
										await utils.downloadFile(imgPath, newImageURL);

										imgToSave = imgPath;
                }
            }

            await Threads.updateInfo(threadID, { imageSrc: imgToSave });

            if (utils.isExists(imagePath, "file")) {
                utils.deleteFile(imagePath);
            }
        } catch (err) {
            console.error(
                err.stack || err.response?.body || err.message || err
            );
        }
    }

    if (
        oldImage &&
        reversed &&
        getThreadData.antiSettings?.notifyChange === true
    ) {
        api.sendMessage(
            getLang("plugins.events.change_thread_image.reversed_t"),
            threadID
        );
    }

    if (!isBot && getThreadData.notifyChange?.status === true) {
        const authorName = (await Users.getInfo(author))?.name || author;
        alertMsg = getLang(
            "plugins.events.change_thread_image.userChangedThreadImage",
            {
                author: authorName,
            }
        );
        if (oldImage && reversed) {
            alertMsg += getLang("plugins.events.change_thread_image.reversed");
        } else if (!oldImage && !reversed) {
            alertMsg += getLang(
                "plugins.events.change_thread_image.setNewImage"
            );
        }

        for (const rUID of getThreadData.notifyChange.registered) {
            await utils.sleep(300);
            api.sendMessage(alertMsg, rUID, (err) =>
                err ? console.error(err) : null
            );
        }
    }

    return;
}
