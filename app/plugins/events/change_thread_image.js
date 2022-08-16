import { } from 'dotenv/config';
import imgbbUploader from "imgbb-uploader";
import moment from 'moment-timezone';

const logger = text => client.modules.logger.custom(text, moment().tz(client.config.timezone).format('YYYY-MM-DD_HH:mm:ss'));
const imgbb_key = process.env.IMGBB_KEY;

export default async function ({ api, event, db, controllers }) {
    const { threadID, author } = event;
    const { Threads, Users } = controllers;
    const getThread = await Threads.checkThread(threadID) || {};
    const getThreadData = getThread.data;
    const getThreadInfo = getThread.info || {};
    const getMonitorServerPerThread = client.data.monitorServerPerThread;

    if (Object.keys(getThreadInfo).length === 0) return;
    const oldImage = getThreadInfo.imageSrc || null;
    let smallCheck = false, reversing = false, atlertMsg = null;
    if (getThreadData.noChangeBoxImage == true && oldImage) {
        const isBot = author == botID;
        const isReversing = client.data.temps.some(i => i.type == 'noChangeBoxImage' && i.threadID == threadID);
        if (!(isBot && isReversing)) {
            reversing = true;
            let thing_to_push = { type: 'noChangeBoxImage', threadID };
            client.data.temps.push(thing_to_push);
            try {
                logger(`${threadID} • Reversing noChangeBoxImage`);
                const imagePath = client.mainPath + `/plugins/cache/${threadID}_${Date.now()}_oldImage.jpg`;
                if (isURL(oldImage)) {
                    await downloadFile(imagePath, oldImage);
                } else {
                    await saveFromBase64(imagePath, oldImage);
                }
                logger(`${threadID} • Downloaded, setting back to old image`);
                api.changeGroupImage(reader(imagePath), threadID, async (e) => {
                    if (e) console.error(e);
                    else {
                        logger(`${threadID} • Reversed to old image`);
                        await deleteFile(imagePath);
                        await new Promise(resolve => setTimeout(resolve, 500));
                        client.data.temps.splice(client.data.temps.indexOf({ type: 'noChangeBoxImage', threadID: threadID }), 1);
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
            const imagePath = client.mainPath + `/plugins/cache/${threadID}_${Date.now()}_oldImage.jpg`;
            await downloadFile(imagePath, newImageURL);
            let imgbb_res;
            if (imgbb_key) {
                try {
                    imgbb_res = (await imgbbUploader(imgbb_key, imagePath)).url;
                } catch(e) {
                    console.error(e);
                    imgbb_res = saveToBase64(imagePath);
                }
            } else imgbb_res = saveToBase64(imagePath);
            newImageURL = imgbb_res;
            await deleteFile(imagePath);
        } catch (err) {
            console.error(err);
        }

        getThreadInfo.imageSrc = newImageURL;
        const allThreads = await Threads.getAll();
        const threadIndex = allThreads.findIndex(e => e.id == threadID);
        getThread.info = getThreadInfo;
        allThreads[threadIndex] = getThread;
        await db.set('threads', allThreads);
    }

    if (!smallCheck && getMonitorServerPerThread[threadID]) {
        const authorName = await Users.getName(author);
        atlertMsg = getLang("plugins.events.change_thread_image.userChangedThreadImage", {
            author: authorName
        });
        if (oldImage && reversing) {
            atlertMsg += getLang("plugins.events.change_thread_image.reversed");
        } else if (!oldImage && !reversing) {
            atlertMsg += getLang("plugins.events.change_thread_image.setNewImage");
        }
        api.sendMessage(atlertMsg, getMonitorServerPerThread[threadID]);
    }

    return;
}
