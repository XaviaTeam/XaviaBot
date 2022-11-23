export default function ({ api, db, controllers }) {
    return async function ({ event }) {
        try {
            switch (event.type) {
                case 'event': {
                    switch (event.logMessageType) {
                        case "log:subscribe":
                            client.registeredMaps.events.get('subcribe')({ event, api, db, controllers });
                            break;
                        case "log:unsubscribe":
                            client.registeredMaps.events.get('unsubcribe')({ event, api, db, controllers });
                            break;
                        case "log:user-nickname":
                            client.registeredMaps.events.get('user-nickname')({ event, api, db, controllers });
                            break;
                        case "log:thread-call":
                            client.registeredMaps.events.get('thread-call')({ event, api, db, controllers });
                            break;
                        case "log:thread-name":
                        case "log:thread-color":
                        case "log:thread-icon":
                        case "log:thread-approval-mode":
                        case "log:thread-admins":
                            client.registeredMaps.events.get('thread-update')({ event, api, db, controllers });
                            break;
                        default:
                            break;
                    }
                    break;
                }
                case 'change_thread_image':
                    client.registeredMaps.events.get('change_thread_image')({ event, api, db, controllers });
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error(err);
        }
    }
}
