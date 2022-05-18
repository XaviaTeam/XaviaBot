export default function ({ api, db, controllers }) {
    return async function ({ event }) {
        if (!event.hasOwnProperty('messageReply')) return;
        const reply = client.replies.find(i => i.messageID == event.messageReply.messageID);
        if (!reply) return;

        const registeredReplies = await import('../../plugins/reply.js');
        try {
            registeredReplies.default({ api, event, db, controllers, reply });
        } catch (err) {
            console.log(err);
        }
    }
}
