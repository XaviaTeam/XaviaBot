const config = {
    name: "example",
    aliases: ["ex"],
    description: "This is an example command",
    usage: "[query]",
    cooldown: 3,
    permissions: [0, 1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "XaviaTeam",
    extra: {
        // will be saved in config.plugins.json
        extraProp: "This is an extra property",
    },
};

/** @type {TOnCallCommand} */
async function onCall({ message }) {
    // Do something
    message
        .send("React or reply to this message (only command caller)")
        .then((data) => {
            data.addReactEvent({ callback: onReaction });
            data.addReplyEvent({ callback: onReply });
        })
        .catch((e) => {
            console.error(e);
        });

    message
        .send("React or reply to this message (everyone)")
        .then((data) => {
            data.addReactEvent({ callback: onReaction, author_only: false });
            data.addReplyEvent({ callback: onReply, author_only: false });
        })
        .catch((e) => {
            console.error(e);
        });
}

/** @type {TReplyCallback} */
async function onReply({ message, getLang, data, xDB, eventData }) {
    // do something when someone replied
}

/** @type {TReactCallback} */
async function onReaction({ message, getLang, data, xDB, eventData }) {
    // do something when someone reacted
}

export { config, onCall };
