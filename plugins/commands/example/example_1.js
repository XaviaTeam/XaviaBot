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
        extraProp: "This is an extra property"
    }
}

const langData = {
    "lang_1": {
        "message": "This is an example message",
    },
    "lang_2": {
        "message": "This is an example message",
    }
}

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
    // Do something
    message.send(getLang("message"));

    // args: Arguments, if /example 1 2 3, args = ["1", "2", "3"]
    // getLang: Get language from langData
    // extra: Extra property from config.plugins.json
    // data { user, thread }
    // userPermissions: User permissions (0: Member, 1: Admin, 2: Bot Admin)
    // prefix: Prefix used
}

export default {
    config,
    langData,
    onCall
}

// or
// export {
//     config,
//     langData,
//     onCall
// }
