import * as structures from '../app/src/database/structures.js';

var config = {
    "NAME": "Xavia", //Bot's name
    "PREFIX": "x", //Bot's prefix
    "ADMINS": [], //Bot's admins ['id1', 'id2', ...]
    "timezone": "Asia/Ho_Chi_Minh", //App's timezone
    "LOG": true, //Debug mode, if true, bot will log all events depending on the log level
    "LOG_LEVEL": 0, //Debug level, 0 = only messages, 1 = messages and event's type, 2 = messages, events
    "FCA_OPTIONS": { //Options for FCA
        "pauseLog": true, //pause FCA's log
        "logLevel": "silent",
        "selfListen": true,
        "listenEvents": true,
        "forceLogin": true,
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8"
    },
    "AUTO_LOGIN": true, //Auto login appstate is not valid using email and password from env //Recommended to change userAgent to the browser you use to login if it's working
    "REFRESH": 7200000, //Refresh system in milliseconds, change this to your liking or set it to 0 to disable
    "DATABASE_SETTINGS": {
        maxConnection: 20,
        storage: process.cwd() + '/src/database/JSON/',
        structures,
        maxRetry: 10,
        retryAfter: 500
    }
}

export default config;
