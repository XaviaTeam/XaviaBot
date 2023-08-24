import { join } from "path";

export default async function ({ event }) {
    const { api } = global;
    const { threadID, author } = event;
    const { Threads, Users } = global.controllers;

    const getThread = (await Threads.get(threadID)) || {};
    const getThreadData = getThread.data || {};
    const getThreadInfo = getThread.info;

    if (!getThreadInfo) return;

    const oldImage = getThreadInfo.imageSrc || null;
    const isBot = author == botID;

    let reversed = false,
        atlertMsg = null;

    if (
        getThreadData.antiSettings &&
        getThreadData.antiSettings.antiChangeGroupImage == true &&
        oldImage
    ) {
        const isReversing = global.data.temps.some(
            (i) => i.type == "antiChangeGroupImage" && i.threadID == threadID
        );

        if (!isBot && !isReversing) {
            global.data.temps.push({ type: "antiChangeGroupImage", threadID });

            try {
                const imagePath = join(
                    global.cachePath,
                    `${threadID}_${Date.now()}_oldImage.jpg`
                );
                if (isURL(oldImage)) {
                    await downloadFile(imagePath, oldImage);
                } else {
                    await saveFromBase64(imagePath, oldImage);
                }

                await api.changeGroupImage(reader(imagePath), threadID);

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

                if (global.isExists(imagePath, "file")) {
                    global.deleteFile(imagePath);
                }
            } catch (err) {
                console.error(err);
            }
        }
    } else {
        let newImageURL = event.image.url;
        try {
            const imagePath = join(
                global.cachePath,
                `${threadID}_${Date.now()}_oldImage.jpg`
            );

            if (newImageURL != null) await downloadFile(imagePath, newImageURL);

            let imgbb_res;
            if (process.env.IMGBB_KEY && newImageURL != null) {
                try {
                    const base64Data = await global
                        .getBase64(newImageURL)
                        .then((base64) => base64);

                    imgbb_res = await global
                        .uploadImgbb(base64Data)
                        .then((url) => url);
                } catch (e) {
                    console.error(
                        e.stack || e.response?.body || e.message || e
                    );
                    imgbb_res = saveToBase64(imagePath);
                }
            } else
                imgbb_res =
                    newImageURL == null ? null : saveToBase64(imagePath);

            newImageURL = imgbb_res;
            await Threads.updateInfo(threadID, { imageSrc: newImageURL });

            if (global.isExists(imagePath, "file")) {
                global.deleteFile(imagePath);
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
        getThreadData?.antiSettings?.notifyChange === true
    ) {
        api.sendMessage(
            getLang("plugins.events.change_thread_image.reversed_t"),
            threadID
        );
    }

    if (!isBot && getThreadData?.notifyChange?.status === true) {
        const authorName = (await Users.getInfo(author))?.name || author;
        atlertMsg = getLang(
            "plugins.events.change_thread_image.userChangedThreadImage",
            {
                author: authorName,
            }
        );
        if (oldImage && reversed) {
            atlertMsg += getLang("plugins.events.change_thread_image.reversed");
        } else if (!oldImage && !reversed) {
            atlertMsg += getLang(
                "plugins.events.change_thread_image.setNewImage"
            );
        }

        for (const rUID of getThreadData.notifyChange.registered) {
            global.sleep(300);
            api.sendMessage(atlertMsg, rUID, (err) =>
                err ? console.error(err) : null
            );
        }
    }

    return;
}
