export default function ({ api, db, controllers }) {
    return async function ({ event }) {
        if (client.maintainance && !client.config.debugThreads.includes(event.threadID)) return;
        try {
            const registeredEvents = await import('../../plugins/event.js');
            registeredEvents.default({ event, api, db, controllers });
        } catch (err) {
            console.log(err);
        }
    }
}
