/*
 * What is this?
 * Just a little sacrifice on memory to improve performance if i'm not mistaken, source: Github.
 * Any better way?
 * Feel free to contribute!
 */

export default function () {
    return new Promise(async (resolve) => {
        const data = {
            messages: new Array(),
            threadIDs: new Array(),
            userIDs: new Array(),
            temps: new Array(),
            monitorServers: new Array(),
            monitorServerPerThread: new Object()
        };

        const { Threads, Users, Moderator } = await client.db.getAll();

        data.threadIDs = Threads.map(thread => thread.id);
        data.userIDs = Users.map(user => user.id);
        data.monitorServers = Moderator['monitorServers'];
        data.monitorServerPerThread = Moderator['monitorServerPerThread'];
        client.maintenance = Moderator['maintenance'];

        for (const thread of Threads) {
            if (thread.data.monitor && !data.monitorServerPerThread[thread.id]) {
                data.monitorServerPerThread[thread.id] = thread.data.monitor;
            }
        }

        client.data = data;
        client.modules.logger.custom(getLang("client.data.connected"), 'DATABASE');

        resolve();
    });
}
