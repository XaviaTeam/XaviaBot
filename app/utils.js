import moment from 'moment-timezone';
const logger = {
    info: (args) => {
        //Green for the tag, reset for the message
        console.log(`\x1b[32m[INFO]\x1b[0m ${args}`);
    },
    warn: (args) => {
        //Yellow for the tag, reset for the message
        console.log(`\x1b[33m[WARN]\x1b[0m ${args}`);
    },
    error: (args) => {
        //Red for the tag, reset for the message
        console.log(`\x1b[31m[ERROR]\x1b[0m ${args}`);
    },
    system: (args) => {
        //Blue for the tag, reset for the message
        console.log(`\x1b[34m[SYSTEM]\x1b[0m ${args}`);
    },
    custom: (args, type) => {
        //Cyan color for the tag, reset for the message
        console.log(`\x1b[36m[${type}]\x1b[0m ${args}`);
    }
};


function printEvent(event) {
    const { LOG_LEVEL, timezone } = client.config;
    const { type, threadID, body, senderID, author, logMessageType } = event;
    if (LOG_LEVEL) {
        const time = moment().tz(timezone).format('YYYY-MM-DD_HH:mm:ss');
        if (LOG_LEVEL == 1) {
            if (type == 'message' || type == 'message_reply') {
                logger.custom(`${threadID} • ${senderID} • ${body ? body : 'Photo, video, sticker, etc.'}`, `${time}`);
            }
        } else {
            if (type == 'event' || type == 'change_thread_image') {
                if (LOG_LEVEL == 2) {
                    logger.custom(`${threadID} • ${author} • ${logMessageType || type || 'Unknown Event'}`, `${time}`);
                } else if (LOG_LEVEL == 3) {
                    console.log(event);
                }
            } else if (type == 'message' || type == 'message_reply') {
                logger.custom(`${threadID} • ${senderID} • ${body ? body : 'Photo, video, sticker, etc.'}`, `${time}`);
            }
        }
    }
}

import controllers from './src/controllers/index.js';
import handlers from './src/handlers/index.js';

function listen(api, db) {
    const {
        handleMessage,
        handleReaction,
        handleReply,
        handleCommand,
        handleEvent,
        handleUnsend
    } = handlers({
        api,
        db,
        controllers: controllers(api, db)
    });


    logger.system('Xavia is ready!');
    console.log(`====== ${Date.now() - client.startTime}ms ======`);


    return (err, event) => {
        if (err) {
            if (err.error && err.error.startsWith('Not logged in') && client.config.AUTO_LOGIN == true) {
                logger.warn(getLang('system.utils.autoLogin'));

                import('../login.js');
            } else {
                console.error(err);
            }
            return;
        }
        printEvent(event);


        if (Object.values(client.data.monitorServerPerThread).some(server => server == event.threadID)) return;
        if (
            client.maintenance == true &&
            !client.data.monitorServers.some(server => server == event.threadID)
        ) return;


        switch (event.type) {
            case "message":
            case "message_reply":
                handleMessage({ event });
                handleReply({ event });
                handleCommand({ event });
                break;
            case "message_reaction":
                handleReaction({ event });
                break;
            case "message_unsend":
                handleUnsend({ event });
                break;
            case "event":
            case "change_thread_image":
                handleEvent({ event });
                break;
            default:
                return;
        }
    }
}


export { listen, logger };
