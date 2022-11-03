// import moment from 'moment-timezone';
import { join } from 'path';

// const logger = text => global.modules.get("logger").custom(text, moment().tz(global.config.timezone).format('YYYY-MM-DD_HH:mm:ss'));

export default async function ({ event }) {
    const { api } = global;
    const { threadID, author } = event;
    const { Threads, Users } = global.controllers;
    const getThread = await Threads.get(threadID) || {};
    const getThreadData = getThread.data || {};
    const getThreadInfo = getThread.info || {};

    if (Object.keys(getThreadInfo).length === 0) return;
    const oldImage = getThreadInfo.imageSrc || null;
    let smallCheck = false, reversing = false, atlertMsg = null;
    if (getThreadData.noChangeBoxImage == true && oldImage) {
        const isBot = author == botID;
        const isReversing = global.data.temps.some(i => i.type == 'noChangeBoxImage' && i.threadID == threadID);
        if (!(isBot && isReversing)) {
            reversing = true;
            let thing_to_push = { type: 'noChangeBoxImage', threadID };
            global.data.temps.push(thing_to_push);
            try {
                // logger(`${threadID} • Reversing noChangeBoxImage`);
                const imagePath = join(global.cachePath, `${threadID}_${Date.now()}_oldImage.jpg`);
                if (isURL(oldImage)) {
                    await downloadFile(imagePath, oldImage);
                } else {
                    await saveFromBase64(imagePath, oldImage);
                }
                // logger(`${threadID} • Downloaded, setting back to old image`);
                api.changeGroupImage(reader(imagePath), threadID, async (e) => {
                    if (e) console.error(e);
                    else {
                        // logger(`${threadID} • Reversed to old image`);
                        await deleteFile(imagePath);
                        await new Promise(resolve => setTimeout(resolve, 500));
                        global.data.temps.splice(global.data.temps.indexOf({ type: 'noChangeBoxImage', threadID: threadID }), 1);
                    }
                });
            } catch (err) {
                console.error(err);
            }
        } else if (isBot) {
            smallCheck = true;
        }
    } else {
        let newImageURL = event.image.url;
        try {
            const imagePath = join(global.cachePath, `${threadID}_${Date.now()}_oldImage.jpg`);
            await downloadFile(imagePath, newImageURL);
            let imgbb_res;
            if (process.env.IMGBB_KEY) {
                try {
                    const base64Data = await global.getBase64(newImageURL).then(base64 => base64).catch(err => null);
                    imgbb_res = await global.uploadImgbb(base64Data).then(url => url).catch(err => null);
                } catch (e) {
                    console.error(e);
                    imgbb_res = saveToBase64(imagePath);
                }
            } else imgbb_res = saveToBase64(imagePath);
            newImageURL = imgbb_res;
            await deleteFile(imagePath);
            await Threads.updateInfo(threadID, { imageSrc: newImageURL });
        } catch (err) {
            console.error(err);
        }

    }

    if (!smallCheck && getThreadData?.notifyChange?.status === true) {
        const authorName = (await Users.getInfo(author))?.name || author;
        atlertMsg = getLang("plugins.events.change_thread_image.userChangedThreadImage", {
            author: authorName
        });
        if (oldImage && reversing) {
            atlertMsg += getLang("plugins.events.change_thread_image.reversed");
        } else if (!oldImage && !reversing) {
            atlertMsg += getLang("plugins.events.change_thread_image.setNewImage");
        }

        for (const rUID of getThreadData.notifyChange.registered) {
            global.sleep(300);
            api.sendMessage(atlertMsg, rUID, (err) => console.error(err));
        }
    }

    return;
}
