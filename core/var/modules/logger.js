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
    custom: (args, type, color = '\x1b[36m') => {
        //Cyan color by default for the tag, reset for the message
        console.log(`${color}[${type}]\x1b[0m ${args}`);
    }
};

export default logger;
