import moment from "moment-timezone";
import handleEvents from "./events.js";
import { handleDatabase } from "./database.js";
import logger from "../var/modules/logger.js";

const eventlog_excluded = ["typ", "presence", "read_receipt"];

/**
 *
 * @param {import('@xaviabot/fca-unofficial').IFCAU_ListenMessage} event
 * @returns
 */
function handleEventLog(event) {
    const { LOG_LEVEL, timezone } = global.config;

    if (LOG_LEVEL == 0) return;
    if (eventlog_excluded.includes(event.type)) return;

    const { type, threadID, body, senderID } = event;

    if (LOG_LEVEL == 1) {
        const time = moment().tz(timezone).format("YYYY-MM-DD_HH:mm:ss");

        if (type == "message" || type == "message_reply") {
            logger.custom(
                `${threadID} • ${senderID} • ${
                    body ? body : "Photo, video, sticker, etc."
                }`,
                `${time}`
            );
        }
    } else if (LOG_LEVEL == 2) {
        console.log(event);
    }

    return;
}

/**
 *
 * @param {string} listenerID
 * @param {xDatabase} xDatabase
 * @returns
 */
export default async function handleListen(listenerID, xDatabase) {
    const {
        handleCommand,
        handleReaction,
        handleMessage,
        handleReply,
        handleUnsend,
        handleEvent,
    } = await handleEvents();

    /**
     *
     * @param {Error | null} error
     * @param {import('@xaviabot/fca-unofficial').IFCAU_ListenMessage} event
     */
    return async (err, event) => {
        if (global.listenerID != listenerID) return;
        if (!event || err) {
            logger.error(getLang("handlers.listen.accountError"));
            logger.error(err);
            process.exit(0);
        }
        if (
            global.maintain &&
            !global.config.MODERATORS.some(
                (e) => e == event.senderID || e == event.userID
            )
        )
            return;

        handleEventLog(event);

        if (global.config.ALLOW_INBOX !== true && event.isGroup === false)
            return;

        if (!eventlog_excluded.includes(event.type)) {
            await handleDatabase({ ...event });
        }

        switch (event.type) {
            case "message":
            case "message_reply":
                handleMessage({ ...event }, xDatabase);
                handleReply({ ...event }, xDatabase);
                handleCommand({ ...event }, xDatabase);
                break;
            case "message_reaction":
                handleReaction({ ...event }, xDatabase);
                break;
            case "message_unsend":
                handleUnsend({ ...event });
                break;
            case "event":
            case "change_thread_image":
                handleEvent({ ...event });
                break;
            case "typ":
                break;
            case "presence":
                break;
            case "read_receipt":
                break;
            default:
                break;
        }
    };
}
