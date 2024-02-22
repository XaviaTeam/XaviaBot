import logger from "../modules/logger.js";
import models from "../models/index.js";

const _4HOURS = 1000 * 60 * 60 * 4;
const MAX_EXP = Number.MAX_SAFE_INTEGER;

/**
 *
 * @param {xDatabase} database
 * @param {import("@xaviabot/fca-unofficial").IFCAU_API} api
 * @returns
 */
export default function getCUser(database, api) {
    const { DATABASE } = database;

    /**
     * Get user info from api
     * @param {String} uid
     * @returns {Promise<User["info"] | null>} Object info or null
     */
    async function getInfoAPI(uid) {
        if (!uid) return null;
        uid = String(uid);
        const info = await api.getUserInfo(uid).catch((_) => []);
        if (info[uid]) {
            updateInfo(uid, { ...info[uid] });

            return info[uid];
        } else {
            create(uid, {});

            return null;
        }
    }

    /**
     * Get full user data from Database, if not exist, run create
     * @param {String} uid
     * @returns {Promise<User | null>} Object info or null
     */
    async function get(uid) {
        if (!uid) return null;
        uid = String(uid);
        let userData = global.data.users.get(uid);

        const isInvalidData = userData === null || userData?.info?.id == undefined;
        const isOutdatedData =
            userData?.hasOwnProperty("lastUpdated") && userData.lastUpdated + _4HOURS < Date.now();

        if (isInvalidData || isOutdatedData) {
            await getInfoAPI(uid);

            userData = global.data.users.get(uid);
        }

        return userData || null;
    }

    /**
     * Get full users data from Database
     * @param {string[]} uids
     * @returns {(User | null)[]} Array of user data
     */
    function getAll(uids) {
        if (uids && Array.isArray(uids))
            return uids.map((uid) => global.data.users.get(String(uid)) || null);
        else return Array.from(global.data.users.values());
    }

    /**
     * Get user info from database
     * @param {String} uid
     * @returns Object info or null
     */
    async function getInfo(uid) {
        if (!uid) return null;
        uid = String(uid);
        const userData = await get(uid);

        return userData?.info || null;
    }

    async function getName(uid) {
        if (!uid) return null;
        uid = String(uid);
        const userData = await get(uid);

        return userData?.info?.name || null;
    }

    /**
     * Get user data from database
     * @param {string} uid
     * @returns Object data or null
     */
    async function getData(uid) {
        if (!uid) return null;
        uid = String(uid);
        const userData = await get(uid);

        return userData?.data || null;
    }

    /**
     * Update user info
     * @param {String} uid
     * @param {Record<string, any} data
     * @returns {Promise<Boolean>}
     */
    async function updateInfo(uid, data) {
        if (!uid || !data || typeof data !== "object" || Array.isArray(data)) return false;
        uid = String(uid);
        const userData = global.data.users.get(uid) || null;
        if (userData !== null) {
            data.thumbSrc = global.utils.getAvatarURL(uid);
            Object.assign(userData.info, data);
            global.data.users.set(uid, userData);

            if (DATABASE === "JSON" || DATABASE === "MONGO") {
                return true;
            }
        } else return create(uid, data);
    }

    /**
     * Update user data; money will not be included.
     * @param {String} uid
     * @param {Object} data
     * @returns Boolean
     */
    async function updateData(uid, data) {
        if (!uid || !data || typeof data !== "object" || Array.isArray(data)) return false;
        uid = String(uid);

        try {
            const userData = await get(uid);
            if (userData !== null) {
                if (data.hasOwnProperty("money")) {
                    logger.warn("Updating money with updateData method is deprecated, please use Balance instead.")
                }

                Object.assign(userData.data, data);
                global.data.users.set(uid, userData);

                if (DATABASE === "JSON" || DATABASE === "MONGO") {
                    return true;
                }
            } else return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    /**
     * Create new user data
     * @param {String} uid
     * @param {Object} data
     * @returns Boolean
     */
    async function create(uid, data) {
        if (!uid || !data) return false;
        uid = String(uid);
        const userData = global.data.users.get(uid) || null;

        delete data.id;
        data.thumbSrc = global.utils.getAvatarURL(uid);

        if (userData === null) {
            global.data.users.set(uid, {
                userID: uid,
                info: data,
                data: { exp: 1, money: 0 },
            });

            if (DATABASE === "JSON") {
                logger.custom(
                    global.getLang(`database.user.get.success`, {
                        userID: uid,
                    }),
                    "DATABASE"
                );
                return true;
            } else if (DATABASE === "MONGO") {
                const createResult = await models.Users.create({
                    userID: uid,
                    info: data,
                    data: { exp: 1, money: 0 },
                }).catch((e) => {
                    console.error(e);
                    return null;
                });

                if (createResult == null) return false;
                logger.custom(
                    global.getLang(`database.user.get.success`, {
                        userID: uid,
                    }),
                    "DATABASE"
                );
                return true;
            }
        } else {
            if (!userData.info) userData.info = {};
            if (!userData.data)
                userData.data = {
                    exp: 1,
                    money: 0,
                };

            Object.assign(userData.info, data);

            global.data.users.set(uid, userData);

            return;
        }
    }

    /**
     *
     * @param {string} uid
     * @param {number} amount
     * @param {boolean} withEffect
     */
    function increaseExp(uid, amount, withEffect) {
        if (!uid || !amount) return false;
        if (!global.utils.isAcceptableNumber(amount)) return false;

        uid = String(uid);

        try {
            const userData = global.data.users.get(uid) || null;
            if (userData !== null) {
                let finalNumber = parseInt(userData.data.exp || 0) + parseInt(amount);

                if (withEffect) {
                    const extraPercentFromEffect = global.plugins.effects.getCalculated(uid).exp;
                    finalNumber = parseInt(finalNumber * (1 + extraPercentFromEffect));
                }

                if (finalNumber > MAX_EXP) finalNumber = MAX_EXP;
                else if (finalNumber < 0) finalNumber = 0;

                userData.data.exp = finalNumber;
                global.data.users.set(uid, userData);

                if (DATABASE === "JSON" || DATABASE === "MONGO") {
                    return true;
                }
            } else return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    /**
     *
     * @param {string} uid
     * @param {number} amount
     * @returns
     */
    function decreaseExp(uid, amount) {
        if (!uid || !amount) return false;
        if (!global.utils.isAcceptableNumber(amount)) return false;

        uid = String(uid);

        try {
            const userData = global.data.users.get(uid) || null;
            if (userData !== null) {
                const finalNumber = parseInt(userData.data.exp || 0) - parseInt(amount);

                if (finalNumber > MAX_EXP) finalNumber = MAX_EXP;
                else if (finalNumber < 0) finalNumber = 0;

                userData.data.exp = finalNumber;
                global.data.users.set(uid, userData);

                if (DATABASE === "JSON" || DATABASE === "MONGO") {
                    return true;
                }
            } else return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    /**
     *
     * @param {String} uid
     * @returns exp as Number or null
     */
    function getExp(uid) {
        if (!uid) return null;
        uid = String(uid);
        const userData = global.data.users.get(uid) || null;
        if (userData !== null) {
            return parseInt(userData.data.exp || 0);
        } else return null;
    }

    /**
     * @deprecated
     * @param {String} uid
     * @returns money as Number or null
     */
    function getMoney(uid) {
        throw new Error("Deprecated, please use Balance instead.");
    }

    /**
     * @deprecated
     * @param {string} uid
     * @param {number} amount
     * @param {boolean} withEffect
     * @returns
     */
    function increaseMoney(uid, amount, withEffect = true) {
        throw new Error("Deprecated, please use Balance instead.");
    }

    /**
     * @deprecated
     * @param {string} uid
     * @param {number} amount
     * @returns
     */
    function decreaseMoney(uid, amount) {
        throw new Error("Deprecated, please use Balance instead.");
    }

    return {
        get,
        getAll,
        getInfo,
        getName,
        getData,
        updateInfo,
        updateData,
        create,
        getExp,
        increaseExp,
        decreaseExp,
        getMoney,
        increaseMoney,
        decreaseMoney,
    };
}
