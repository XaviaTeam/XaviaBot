const _4HOURS = 1000 * 60 * 60 * 4;
const MAX_BALANCE = BigInt(Number.MAX_VALUE);

export default function () {
    const { DATABASE } = global.config;
    const logger = global.modules.get('logger');

    /**
     * Get user info from api
     * @param {String} uid 
     * @returns Object info or null
     */
    async function getInfoAPI(uid) {
        if (!uid) return null;
        uid = String(uid);
        const info = await global.api.getUserInfo(uid) || [];
        if (info[uid]) {
            let _info = { ...info[uid] };
            delete _info.thumbSrc;

            updateInfo(uid, _info);

            return info;
        } else {
            create(uid, {});

            return null;
        };
    }

    /**
     * Get full user data from Database, if not exist, run create
     * @param {String} uid 
     * @returns Object data or null
     */
    async function get(uid) {
        if (!uid) return null;
        uid = String(uid);
        const userData = global.data.users.get(uid) || null;

        if (userData === null || !userData?.info?.id) {
            if (userData === null || userData?.hasOwnProperty("lastUpdated")) {
                if (userData === null || userData.lastUpdated + _4HOURS < Date.now()) {
                    await getInfoAPI(uid);
                }
            }

            return global.data.users.get(uid) || null;
        } else return userData;
    }

    /**
     * Get full users data from Database
     * @param {Array} uids 
     * @returns Array of user data
     */
    function getAll(uids) {
        if (uids && Array.isArray(uids)) return uids.map(uid => global.data.users.get(String(uid)) || null);
        else return Array.from(global.data.users.values());
    }

    /**
     * Get user info from database
     * @param {String} uid 
     * @returns Object data or null
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
     * @param {String} uid 
     * @returns Object data or null
     */
    async function getData(uid) {
        if (!uid) return null;
        uid = String(uid);
        const userData = await get(uid);

        return userData?.data || null;
    }

    /**
     * Update user info, if user not yet in database, try to create, if cant -> return false
     * @param {String} uid 
     * @param {Object} data 
     * @returns Boolean
     */
    function updateInfo(uid, data) {
        if (!uid || !data || typeof data !== "object" || Array.isArray(data)) return false;
        uid = String(uid);
        const userData = global.data.users.get(uid) || null;
        if (userData !== null) {
            Object.assign(userData.info, data);
            global.data.users.set(uid, userData);

            if (DATABASE === 'JSON' || DATABASE === 'MONGO') {
                return true;
            }
        } else return create(uid, data);
    }


    /**
     * Update user data, if user not yet in database, try to create, if cant -> return false
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
                    if (BigInt(data.money) > MAX_BALANCE) data.money = MAX_BALANCE;
                    else if (BigInt(data.money) < 0) data.money = 0n;
                    else data.money = BigInt(data.money);

                    data.money = String(data.money);
                }

                Object.assign(userData.data, data);
                global.data.users.set(uid, userData);

                if (DATABASE === 'JSON' || DATABASE === 'MONGO') {
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
    function create(uid, data) {
        if (!uid || !data) return false;
        uid = String(uid);
        const userData = global.data.users.get(uid) || null;
        if (userData === null) {
            data.thumbSrc = global.getAvatarURL(uid);

            global.data.users.set(uid, {
                userID: uid,
                info: data,
                data: {}
            });

            if (DATABASE === 'JSON') {
                logger.custom(global.getLang(`database.user.get.success`, { userID: uid }), 'DATABASE');
                return true;
            } else if (DATABASE === 'MONGO') {
                global.data.models.Users.create({
                    userID: uid,
                    info: data,
                    data: { exp: 1, money: "0" }
                }, (err, res) => {
                    if (err) return false;
                    logger.custom(global.getLang(`database.user.get.success`, { userID: uid }), 'DATABASE');
                    return true;

                });
            }
        } else return true;
    }

    /**
     * 
     * @param {String} uid 
     * @returns money as String or null
     */
    function getMoney(uid) {
        if (!uid) return null;
        uid = String(uid);
        const userData = global.data.users.get(uid) || null;
        if (userData !== null) {
            return userData.data.money || "0";
        } else return null;
    }

    function increaseMoney(uid, amount) {
        if (!uid || !amount) return false;
        uid = String(uid);
        if (Number(amount) === NaN) return false;
        try {
            const userData = global.data.users.get(uid) || null;
            if (userData !== null) {
                let finalNumber = BigInt(amount) + BigInt(userData.data.money || 0);
                finalNumber = finalNumber < 0 ? 0 : finalNumber > MAX_BALANCE ? MAX_BALANCE : finalNumber;
                userData.data.money = String(finalNumber);
                global.data.users.set(uid, userData);

                if (DATABASE === 'JSON' || DATABASE === 'MONGO') {
                    return true;
                }
            } else return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    function decreaseMoney(uid, amount) {
        if (!uid || !amount) return false;
        uid = String(uid);
        if (Number(amount) === NaN) return false;
        try {
            const userData = global.data.users.get(uid) || null;
            if (userData !== null) {
                let finalNumber = BigInt(userData.data.money || 0) - BigInt(amount);
                finalNumber = finalNumber < 0 ? 0 : finalNumber > MAX_BALANCE ? MAX_BALANCE : finalNumber;
                userData.data.money = String(finalNumber);
                global.data.users.set(uid, userData);

                if (DATABASE === 'JSON' || DATABASE === 'MONGO') {
                    return true;
                }
            } else return false;
        } catch (e) {
            console.error(e);
            return false;
        }
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
        getMoney,
        increaseMoney,
        decreaseMoney
    };
}
