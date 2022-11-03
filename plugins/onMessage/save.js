export default function ({ message }) {
    const { body, messageID, senderID, attachments } = message;

    global.data.messages.push({
        body,
        messageID,
        attachments
    });
}
