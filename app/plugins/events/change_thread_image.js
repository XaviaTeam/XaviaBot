import { } from 'dotenv/config';
import imgbbUploader from "imgbb-uploader";

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
                const imagePath = client.mainPath + `/plugins/cache/${threadID}_${Date.now()}_oldImage.jpg`;
                await downloadFile(imagePath, oldImage);
                api.changeGroupImage(reader(imagePath), threadID, async () => {
                    await deleteFile(imagePath);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    client.data.temps.splice(client.data.temps.indexOf({ type: 'noChangeBoxImage', threadID: threadID }), 1);
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
            await downloadFile(imagePath, newImageURL)
            const imgbb_res = await imgbbUploader(imgbb_key, imagePath);
            newImageURL = imgbb_res.url;
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
