import { } from 'dotenv/config';
import imgbbUploader from "imgbb-uploader";
import { writeFileSync, createReadStream, unlinkSync } from 'fs';

const imgbb_key = process.env.IMGBB_KEY;

export default async function ({ api, event, db, controllers }) {
    if (Object.keys(getThreadInfo).length === 0) return;
    const oldImage = getThreadInfo.imageSrc || null;
    let atlertMsg = '"_replaceme_" has changed the group image.',
        smallCheck = false;
    if (getThreadData.noChangeBoxImage == true && oldImage) {
        const isBot = author == botID;
        const isReversing = client.data.temps.some(i => i.type == 'noChangeBoxImage' && i.threadID == threadID);
        if (!(isBot && isReversing)) {
            let thing_to_push = { type: 'noChangeBoxImage', threadID };
            client.data.temps.push(thing_to_push);
            atlertMsg += '\nBecause noChangeBoxImage is enabled, the group image has been changed back.';
            try {
                const imgBuffer = (await get(oldImage, {
                    responseType: 'arraybuffer'
                })).data;
                const imagePath = client.mainPath + `/plugins/cache/${threadID}_${Date.now()}_oldImage.jpg`;
                writeFileSync(imagePath, Buffer.from(imgBuffer, 'utf-8'));
                api.changeGroupImage(createReadStream(imagePath), threadID, async () => {
                    unlinkSync(imagePath);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    client.data.temps.splice(client.data.temps.indexOf({ type: 'noChangeBoxImage', threadID: threadID }), 1);
                });
            } catch (err) {
                console.log(err);
            }
        } else if (isBot) {
            smallCheck = true;
        }
    } else {
        let newImageURL = event.image.url;
        try {
            const imgBuffer = (await get(newImageURL, {
                responseType: 'arraybuffer'
            })).data;
            const imagePath = client.mainPath + `/plugins/cache/${threadID}_${Date.now()}_oldImage.jpg`;
            writeFileSync(imagePath, Buffer.from(imgBuffer, 'utf-8'));
            const imgbb_res = await imgbbUploader(imgbb_key, imagePath);
            newImageURL = imgbb_res.url;
            unlinkSync(imagePath);
        } catch (err) {
            console.log(err);
        }
        if (!oldImage)
            atlertMsg += '\nBecause noChangeBoxImage is enabled but the group image is not set, so it will be set to the newly added group image.';
        getThreadInfo.imageSrc = newImageURL;
        const allThreads = await Threads.getAll();
        const threadIndex = allThreads.findIndex(e => e.id == threadID);
        getThread.info = getThreadInfo;
        allThreads[threadIndex] = getThread;
        await db.set('threads', allThreads);
    }
    if (!smallCheck && getMonitorServerPerThread[threadID]) {
        const authorName = await Users.getName(author);
        atlertMsg = atlertMsg.replace('_replaceme_', `${authorName}`);
        api.sendMessage(atlertMsg, getMonitorServerPerThread[threadID]);
    }

    return;
}
