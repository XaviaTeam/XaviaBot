import handleMessage from './handleMessage.js';
import handleReaction from './handleReaction.js';
import handleReply from './handleReply.js';
import handleCommand from './handleCommand.js';
import handleEvent from './handleEvent.js';
import handleUnsend from './handleUnsend.js';

export default function ({ api, db, controllers }) {
    return {
        handleMessage: handleMessage({ api, db, controllers }),
        handleReaction: handleReaction({ api, db, controllers }),
        handleReply: handleReply({ api, db, controllers }),
        handleCommand: handleCommand({ api, db, controllers }),
        handleEvent: handleEvent({ api, db, controllers }),
        handleUnsend: handleUnsend({ api, db, controllers })
    }
}
