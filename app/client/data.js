/*
 * What is this?
 * Just a little sacrifice on memory to improve performance if i'm not mistaken, source: Github.
 * Any better way?
 * Feel free to contribute!
 */

export default function (client) {
    return new Promise((resolve) => {
        const data = {
            message: new Array(),
            threadIDs: new Array(),
            userIDs: new Array(),
            temps: new Array(),
            monitorServers: new Array(),
            monitorServerPerThread: new Object()
        };
        
        const { Threads, Users, Admin } = client.db.getAll();

        data.threadIDs = Threads.map(thread => thread.id);
        data.userIDs = Users.map(user => user.id);
        data.monitorServers = Admin['monitorServers'];
        data.monitorServerPerThread = Admin['monitorServerPerThread'];
        client.maintenance = Admin['maintenance'];

        client.data = data;
        client.modules.logger.custom('Connected to database.', 'DATABASE');

        resolve(client);
    });
}
