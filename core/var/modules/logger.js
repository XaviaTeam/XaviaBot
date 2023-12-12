import axios from "axios";

const logger = {
    info: (message) => {
        //Green for the tag, reset for the message
        console.log(`\x1b[32m[INFO]\x1b[0m ${message}`);
    },
    warn: (message) => {
        //Yellow for the tag, reset for the message
        console.log(`\x1b[33m[WARN]\x1b[0m ${message}`);
    },
    error: (message) => {
        //Red for the tag, reset for the message
        console.log(`\x1b[31m[ERROR]\x1b[0m ${message?.message || message}`);
        if (message instanceof Error) {
            console.error(message.stack);
        } else if (axios.isAxiosError(message)) {
            console.error(message.toJSON());
        } else if (typeof message === "object") {
            console.error(message);
        }
    },
    system: (message) => {
        //Blue for the tag, reset for the message
        console.log(`\x1b[34m[SYSTEM]\x1b[0m ${message}`);
    },
    custom: (message, type, color = "\x1b[36m") => {
        //Cyan color by default for the tag, reset for the message
        console.log(`${color}[${type}]\x1b[0m ${message}`);
    },
};

export default logger;
