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
async function onCall({ message, balance }) {
    // caller balance
    balance.add(2000);
    balance.sub(2000);
    balance.set(2000);

    balance.get(); // caller money

    // other balance
    const otherBalance = balance.from("id of other user");
    if (otherBalance != null) {
        otherBalance.add(2000);
        otherBalance.sub(2000);
        otherBalance.set(2000);

        otherBalance.get(); // other user money
    }

    balance.make(123n, "200", 233); // Convert all parameters to bigint and calculate their sum. Will throw an error if one is not a valid number
    balance.makeSafe(123n, false, null); // Similar to balance.make, but returns null instead of throwing an error

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
async function onReply({ message, balance, getLang, data, xDB, eventData }) {
    // do something when someone replied
}

/** @type {TReactCallback} */
async function onReaction({ message, balance, getLang, data, xDB, eventData }) {
    // do something when someone reacted
}

export { config, onCall };
