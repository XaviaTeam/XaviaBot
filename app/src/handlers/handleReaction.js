export default function ({api, db, controllers}) {
    return function({event}) {
        const reaction = client.reactions.find(i => i.messageID == event.messageID);
        if (!reaction) return;
        
        const registeredReaction = require('../../plugins/reaction.js');
        try {
            registeredReaction({api, event, db, controllers, reaction});
        } catch (err) {
            console.log(err);
        }
    }
}
