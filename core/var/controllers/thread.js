import { resolve as resolvePath } from 'path';
const _4HOURS = 1000 * 60 * 60 * 4;

async function saveImg(url) {
    if (!url) return null;
    try {
        if (process.env.IMGBB_KEY) {
            const base64Data = await global.getBase64(url).then(base64 => base64).catch(err => null);
            if (base64Data) {
                const imgURL = await global.uploadImgbb(base64Data).then(url => url).catch(err => null);
                if (imgURL) return imgURL;
            }
        }

        const tempPath = resolvePath(global.cachePath, `${Date.now()}temp.png`);
        await global.downloadFile(tempPath, url);
        let returnData = global.saveToBase64(tempPath);
        global.deleteFile(tempPath);

        return returnData;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export default function () {
    const { DATABASE } = global.config;
    const logger = global.modules.get('logger');

    /**
     * Get thread info from api
     * @param {String} tid 
     * @returns Object info or null
     */
    async function getInfoAPI(tid) {
        if (!tid) return null;
        tid = String(tid);
        const info = await global.api.getThreadInfo(tid) || null;
        if (info) {
            let _info = { ...info };
            delete _info.userInfo;

            for (const userObj of info.userInfo) {
                global.controllers.Users.create(userObj.id, userObj);
            }

            info.isGroup === true ? await updateInfo(tid, _info) : null;

            return info;
        } else {
            create(tid, {});

            return null;
        };
    }

    /**
     * Get full thread data from Database, if not exist, run create
     * @param {String} tid 
     * @returns Object data or null
     */
    async function get(tid) {
        if (!tid) return null;
        tid = String(tid);
        const threadData = global.data.threads.get(tid) || null;

        if (threadData === null || !threadData?.info?.threadID) {
            if (threadData === null || threadData?.hasOwnProperty("lastUpdated")) {
                if (threadData === null || threadData.lastUpdated + _4HOURS < Date.now()) {
                    await getInfoAPI(tid);
                }
            }

            return global.data.threads.get(tid) || null;
        } else return threadData;
    }

    /**
     * Get full threads data from Database
     * @param {Array} tids 
     * @returns Array of thread data
     */
    function getAll(tids) {
        if (tids && Array.isArray(tids)) return tids.map(tid => global.data.threads.get(String(tid)) || null);
        else return Array.from(global.data.threads.values());
    }

    /**
     * Get thread info from database
     * @param {String} tid 
     * @returns Object data or null
     */
    async function getInfo(tid) {
        if (!tid) return null;
        tid = String(tid);
        const threadData = await get(tid);

        return threadData?.info || null;
    }


    /**
     * Get thread data from database
     * @param {String} tid 
     * @returns Object data or null
     */
    async function getData(tid) {
        if (!tid) return null;
        tid = String(tid);
        const threadData = await get(tid);

        return threadData?.data || null;
    }

    /**
     * Update thread info, if thread not yet in database, try to create, if cant -> return false
     * @param {String} tid 
     * @param {Object} data 
     * @returns Boolean
     */
    async function updateInfo(tid, data) {
        if (!tid || !data || typeof data !== "object" || Array.isArray(data)) return false;
        tid = String(tid);
        if (data?.hasOwnProperty("imageSrc")) {
            if (data.imageSrc) {
                data.imageSrc = await saveImg(data.imageSrc);
            }
        }
        var threadData = global.data.threads.get(tid) || null;

        data.members = threadData?.info?.members || [];
        if (data?.participantIDs) for (const participantID of data.participantIDs) {
            if (!data.members.some(e => e.userID == participantID)) {
                data.members.push({
                    userID: participantID
                });
            }
        }

        let invalidIDs = [];
        for (const mem of data.members) {
            if (data.participantIDs && !data.participantIDs.includes(mem.userID)) {
                invalidIDs.push(mem.userID);
            }
        }

        if (invalidIDs.length > 0) {
            data.members = data.members.filter(e => !invalidIDs.includes(e.userID));
        }

        delete data.participantIDs;
        delete data.threadName;
        if (data.members.length == 0) delete data.members;
        if (threadData !== null) {
            Object.assign(threadData.info, data);
            global.data.threads.set(tid, threadData);

            if (DATABASE === 'JSON' || DATABASE === 'MONGO') {
                return true;
            }
        } else return create(tid, data);
    }


    /**
     * Update thread data, if thread not yet in database, try to create, if cant -> return false
     * @param {String} tid 
     * @param {Object} data 
     * @returns Boolean
     */
    async function updateData(tid, data) {
        if (!tid || !data || typeof data !== "object" || Array.isArray(data)) return false;
        tid = String(tid);
        const threadData = await get(tid);
        if (threadData !== null) {
            Object.assign(threadData.data, data);
            global.data.threads.set(tid, threadData);

            if (DATABASE === 'JSON' || DATABASE === 'MONGO') {
                return true;
            }
        } else return false;
    }

    /**
     * Create new thread data
     * @param {String} tid 
     * @param {Object} data 
     * @returns Boolean
     */
    function create(tid, data) {
        if (!tid || !data) return false;
        tid = String(tid);
        if (data.isGroup === false) return false;
        const threadData = global.data.threads.get(tid) || null;
        if (threadData === null) {
            global.data.threads.set(tid, {
                threadID: tid,
                info: data,
                data: {}
            });

            if (DATABASE === 'JSON') {
                global.updateJSON();
                logger.custom(global.getLang(`database.thread.get.success`, { threadID: tid }), 'DATABASE');
                return true;
            } else if (DATABASE === 'MONGO') {
                global.data.models.Threads.create({
                    threadID: tid,
                    info: data,
                    data: { prefix: null }
                }, (err, doc) => {
                    if (err) return false;
                    logger.custom(global.getLang(`database.thread.get.success`, { threadID: tid }), 'DATABASE');
                    return true;
                });
            }
        } else return true;
    }

    return {
        get,
        getAll,
        getInfo,
        getInfoAPI,
        getData,
        updateInfo,
        updateData,
        create
    };
}
