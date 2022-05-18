export default function ({ api, db, controllers }) {
    return async function ({ event }) {
        if (client.maintainance && !client.config.debugThreads.includes(event.threadID)) return;
        try {
            switch (event.type) {
                case 'event': {
                    switch (event.logMessageType) {
                        case "log:subscribe":
                            client.events.get('subcribe')({ event, api, db, controllers });
                            break;
                        case "log:unsubscribe":
                            client.events.get('unsubcribe')({ event, api, db, controllers });
                            break;
                        case "log:user-nickname":
                            client.events.get('user-nickname')({ event, api, db, controllers });
                            break;
                        case "log:thread-call":
                            client.events.get('thread-call')({ event, api, db, controllers });
                            break;
                        case "log:thread-name":
                        case "log:thread-color":
                        case "log:thread-icon":
                        case "log:thread-approval-mode":
                        case "log:thread-admins":
                            client.events.get('thread-update')({ event, api, db, controllers });
                            break;
                        default:
                            break;
                    }
                    break;
                }
                case 'change_thread_image':
                    client.events.get('change_thread_image')({ event, api, db, controllers });
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.log(err);
        }
    }
}
