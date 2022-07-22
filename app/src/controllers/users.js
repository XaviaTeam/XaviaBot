import { logger } from '../../utils.js';
export default function (api, db) {
    async function getAll() {
        return await db.get('users') || [];
    }
    async function getInfoApi(uid) {
        uid = uid.toString();
        const newUserInfo = (await api.getUserInfo(uid))[uid] || {};

        const users = await db.get('users');
        const userIndex = users.findIndex(item => item.id === uid);
        if (userIndex > -1) {
            users[userIndex].info = newUserInfo;
        } else {
            const newUser = {
                id: uid,
                info: newUserInfo,
                money: 0,
                data: {
                    banned: false
                }
            };

            users.push(newUser);
        }
        await db.set('users', users);
        return newUserInfo;
    }
    async function checkUser(uid) {
        uid = uid.toString();
        try {
            const users = await db.get('users');
            const user = users.find(item => item.id === uid);

            if (user) {
                return user;
            } else {
                const getUser = await getInfoApi(uid);
                if (Object.keys(getUser).length < 0) {
                    return false;
                }
                const newUser = {
                    id: uid,
                    info: getUser,
                    data: {
                        money: 0,
                        banned: false
                    }
                }

                users.push(newUser);
                await db.set('users', users);
                return newUser;
            }
        } catch (err) {
            logger.error(err);
            return false;
        }
    }
    async function getData(uid) {
        uid = uid.toString();
        const user = await checkUser(uid);
        if (!user) {
            return false;
        }
        return user.data;
    }
    async function getInfo(uid) {
        uid = uid.toString();
        const user = await checkUser(uid);
        if (!user) {
            return false;
        }
        return user.info || {};
    }
    async function getName(uid) {
        uid = uid.toString();
        const user = await checkUser(uid);
        if (!user) {
            return 'Facebook User';
        }
        return user.info.name;
    }
    async function setData(uid, data) {
        uid = uid.toString();
        const user = await checkUser(uid);
        if (!user) {
            return false;
        }
        try {
            const users = await db.get('users');
            const userIndex = users.findIndex(item => item.id === uid);
            users[userIndex].data = data;
            await db.set('users', users);
            return true;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    return {
        getAll,
        getData,
        getInfo,
        getName,
        setData,
        checkUser
    }
}
