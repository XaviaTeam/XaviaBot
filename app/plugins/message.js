export default {
    tagAll: {
        caseSenstive: true,//automatically lowercase the body if false
        execute: async ({ api, event, db, controllers }) => {
            if (event.body == '@all' || event.body == '@everyone') {
                const threadInfo = await controllers.Threads.getInfo(event.threadID) || {};
                if (!threadInfo.hasOwnProperty('participantIDs')) return;
                const participantIDs = threadInfo.participantIDs.filter(e => e != event.senderID && e != botID);
                var msg = event.body.slice(1),
                    mentions = [];
                const emptyChar = '\u200B';
                let ptcpLength = participantIDs.length;
                for (let i = 0; i < ptcpLength; i++) {
                    if (msg.length > i) msg += emptyChar;
                    mentions.push({
                        tag: msg[i],
                        id: participantIDs[i]
                    })
                }
                api.sendMessage({
                    body: msg,
                    mentions
                }, event.threadID);
                return;
            }
        }
    }
}
