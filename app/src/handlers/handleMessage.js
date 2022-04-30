import messageFunctions from '../../plugins/message.js';

const registeredFunctions = new Map();

for (const key in messageFunctions) {
    registeredFunctions.set(key, messageFunctions[key]);
}

export default function ({api, db, controllers}) {
    return async function ({ event }) {
        if (event.senderID == botID) return;
        if (client.maintainance && !client.config.debugThreads.includes(event.threadID)) return;
        const input = event.body;
        client.data.message.push({
            msgID: event.messageID,
            body: input,
            attachment: event.attachments
        });
        for (const [key, value] of registeredFunctions) {
            const newEvent = event;
            if (value.caseSensitive == false) {
                newEvent.body = input.toLowerCase();
            }
            try {
                value.execute({api, event: newEvent, db, controllers});
            } catch (err) {
                console.log(err);
            }
        }
    }
}
