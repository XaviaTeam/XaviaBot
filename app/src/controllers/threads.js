import { } from 'dotenv/config';
import imgbbUploader from 'imgbb-uploader';
import { logger } from '../../utils.js';

const imgbb_key = process.env.IMGBB_KEY;
export default function (api, db) {
    async function getAll() {
        return await db.get('threads') || [];
    }
    async function getInfoApi(tid) {
        tid = tid.toString();
        const newThreadInfo = await api.getThreadInfo(tid) || {};

        const threads = await db.get('threads');
        const threadIndex = threads.findIndex(item => item.id === tid);

        let newImageURL = newThreadInfo.imageSrc;
        if (newImageURL) {
            try {
                const imagePath = client.mainPath + `/src/controllers/cache/${tid}_${Date.now()}_oldImage.jpg`;
                await downloadFile(imagePath, newImageURL);
                const imgbb_res = await imgbbUploader(imgbb_key, imagePath);
                newImageURL = imgbb_res.url;
                await deleteFile(imagePath);
            } catch (err) {
                console.error(err);
            }
            newThreadInfo.imageSrc = newImageURL;
        }

        delete newThreadInfo.userInfo;

        if (threadIndex > -1) {
            threads[threadIndex].info = newThreadInfo;
        } else {
            const newThread = {
                id: tid,
                info: newThreadInfo,
                data: {
                    banned: false,
                    nsfw: false,
                    resend: false,
                    active: true,
                    monitor: null
                }
            };

            threads.push(newThread);
        }
        await db.set('threads', threads);
        return newThreadInfo;
    }
    async function checkThread(tid) {
        if (client.data.temps.some(e => e.type == 'newMonitor' && e.for == tid)) return false;
        if (Object.values(client.data.monitorServerPerThread).some(server => server == tid)) return false;
        tid = tid.toString();
        try {
            const threads = await db.get('threads');
            const thread = threads.find(item => item.id === tid);

            if (thread) {
                return thread;
            } else {
                const getThread = await getInfoApi(tid);
                if (Object.keys(getThread).length < 0 || getThread.isGroup == false) {
                    return false;
                }
                const newThread = {
                    id: tid,
                    info: getThread,
                    data: {
                        banned: false,
                        nsfw: false,
                        resend: false,
                        active: true
                    }
                }

                threads.push(newThread);
                await db.set('threads', threads);
                return newThread;
            }
        } catch (err) {
            logger.error(err);
            return false;
        }
    }
    async function getData(tid) {
        tid = tid.toString();
        const thread = await checkThread(tid);
        if (!thread) {
            return false;
        }
        return thread.data;
    }
    async function getInfo(tid) {
        tid = tid.toString();
        const thread = await checkThread(tid);
        if (!thread) {
            return false;
        }
        return thread.info || {};
    }
    async function getName(tid) {
        tid = tid.toString();
        const thread = await checkThread(tid);
        if (!thread) {
            return 'Facebook Thread';
        }
        return thread.info.name;
    }
    async function setData(tid, data) {
        tid = tid.toString();
        const thread = await checkThread(tid);
        if (!thread) {
            return false;
        }
        try {
            const threads = await db.get('threads');
            const index = threads.findIndex(item => item.id === tid);
            threads[index].data = data;
            await db.set('threads', threads);
            return true;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    return {
        getInfoApi,
        getAll,
        getData,
        getInfo,
        getName,
        setData,
        checkThread
    }
}
