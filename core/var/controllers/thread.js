import { join } from "path";
import logger from "../modules/logger.js";
import models from "../models/index.js";

const _4HOURS = 1000 * 60 * 60 * 4;

async function saveImg(url, threadID) {
    if (!url) return null;
    const { utils } = global;
    try {
        if (process.env.IMGBB_KEY) {
            const imgURL = await utils
                .uploadImgbb(url)
                .then((url) => url)
                .catch((err) => null);

            if (imgURL) return imgURL;
        }

        const imgPath = join(global.tPath, `${threadID}.jpg`);
        await utils.downloadFile(imgPath, url);

        return imgPath;
    } catch (e) {
        console.error(e);
        return null;
    }
}

/**
 *
 * @param {xDatabase} database
 * @param {import("@xaviabot/fca-unofficial").IFCAU_API} api
 * @returns
 */
export default function getCThread(database, api) {
    const { DATABASE } = database;
    /**
     * Get thread info from api
     * @param {String} tid
     * @returns {Promise<import('@xaviabot/fca-unofficial').IFCAU_Thread | null>} Object info or null
     */
    async function getInfoAPI(tid) {
        if (!tid) return null;
        tid = String(tid);
        const info = await api.getThreadInfo(tid).catch((_) => null);
        if (!info) {
            create(tid, {});

            return null;
        }

        if (info.adminIDs) {
            // backward compatibility for older fca versions
            info.adminIDs = info.adminIDs.map((e) => e?.id || e);
        }

        let _info = { ...info };
        delete _info.userInfo;

        for (const userObj of info.userInfo) {
            global.controllers.Users.create(userObj.id, userObj);
        }

        if (info.isGroup === true) {
            await updateInfo(tid, _info);
        }

        return info;
    }

    /**
     * Get full thread data from Database, if not exist, run create
     * @param {String} tid
     * @returns {Promise<Thread | null>} Object info or null
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
     * @param {string[]} tids
     * @returns {(Thread | null)[]} Array of thread data
     */
    function getAll(tids) {
        if (tids && Array.isArray(tids))
            return tids.map((tid) => global.data.threads.get(String(tid)) || null);
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
                data.imageSrc = await saveImg(data.imageSrc, tid);
            }
        }
        const threadData = global.data.threads.get(tid) || null;

        data.members = threadData?.info?.members || [];
        if (data?.participantIDs)
            for (const participantID of data.participantIDs) {
                if (!data.members.some((e) => e.userID == participantID)) {
                    data.members.push({
                        userID: participantID,
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
            data.members = data.members.filter((e) => !invalidIDs.includes(e.userID));
        }

        delete data.participantIDs;
        delete data.threadName;
        if (data.members.length == 0) delete data.members;
        if (threadData !== null) {
            Object.assign(threadData.info, data);
            global.data.threads.set(tid, threadData);

            if (DATABASE === "JSON" || DATABASE === "MONGO") {
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

            if (DATABASE === "JSON" || DATABASE === "MONGO") {
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
    async function create(tid, data) {
        if (!tid || !data) return false;
        tid = String(tid);
        if (data.isGroup === false) return false;
        const threadData = global.data.threads.get(tid) || null;
        if (threadData === null) {
            global.data.threads.set(tid, {
                threadID: tid,
                info: data,
                data: { prefix: null },
            });

            if (DATABASE === "JSON") {
                await database.update();
                logger.custom(
                    global.getLang(`database.thread.get.success`, {
                        threadID: tid,
                    }),
                    "DATABASE"
                );
                return true;
            } else if (DATABASE === "MONGO") {
                try {
                    await models.Threads.create({
                        threadID: tid,
                        info: data,
                        data: { prefix: null },
                    });

                    logger.custom(
                        global.getLang(`database.thread.get.success`, {
                            threadID: tid,
                        }),
                        "DATABASE"
                    );
                    return true;
                } catch (error) {
                    console.error(error);
                    return false;
                }
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
        create,
    };
}
