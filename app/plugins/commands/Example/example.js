export const config = {
    name: "Example",
    about: "This is an example plugin",
    credits: "Anonymous",//Credits to the author of the plugin
    dependencies: [//dependencies required to run the plugin
        "dependency",
        "anotherDependency"
    ],
    extra: { // extra settings for the plugins, will be saved in the ./config/config.plugins.json
        "extraSetting": "extraValue"
    },
    onLoad: function ({ db }) {
        //code here what you want to do while the plugin is loading
    }
}

export const langData = {
    "en_US": {
        "Example": "This is a langData for {name} command"
    },
    "vi_VN": {
        "Example": "Đây là một langData cho {name} command"
    }
}


function exampleCommand() {
    const config = {
        name: "example", // default is the function name
        aliases: ["ex"], // the command will be called when using prefix + example or prefix + ex, default is [name]
        version: "1.0.0", // the version of the command
        description: "This is an example command",
        usage: "[number]", // will be prefix + example + [number], default is prefix + name
        permissions: [], // 0 = regular member, 1 = group admin, 2 = bot moderator, could be an array of numbers or a number
                         // if you just leave a number, for ex: permissions: 2, it will be [0, 1, 2]
                         // [0, 1, 2] = [*] = 2 = regular member, group admin, bot moderator
                         // default is [*]
        cooldown: 5, // by seconds, default is 5
        nsfw: false,
        visible: true // if the command is visible in the help command, default is true
    }

    // if no config/property provided, this will be the default value as mentioned above
    /**
     * {
     *    name: "exampleCommand",
     *    aliases: ["exampleCommand"],
     *    version: "1.0.0",
     *    description: "",
     *    usage: "",
     *    permissions: [*],
     *    cooldown: 5,
     *    nsfw: false,
     *    visible: true
     * }
     */

    const onCall = async ({ api, message, args, getLang, db, controllers, userPermissions, prefix }) => {
        const { threadID, messageID, senderID, body, messageReply, send, reply, react } = message;
        // your script here

        const dependency = libs["dependency"]; // call the installed dependency


        send("This is an example command"); //send a message to the chat

        send("This is an example command", true); //send a direct message to the user

        reply("This is an example command"); //reply to the message

        react("🤔"); //react to the message

        // callback, applied to send, reply, react
        send("This is an example command with callback")
            .then((err, info) => {
                // when the message is sent
            })

        // using getLang
        send(getLang("Example", { name: "Example" })); //send a message to the chat
    }

    return { config, onCall };
}

function another_exampleCommand() {
    const config = {
        name: "Another example command",
        aliases: ["anotherExample", "anotherEx"],
        version: "1.0.0",
        description: "This is an example command",
        usage: "",
        permissions: [],
        cooldown: 5,
        nsfw: false,
        visible: true
    }

    const onCall = async ({ api, message, args, getLang, db, controllers, userPermissions, prefix }) => {
        const { threadID, messageID, senderID, body, messageReply, send, reply, react } = message;
        // your script here
    }

    return { config, onCall };
}

function onMessage({ api, message, getLang, db, controllers }) {
    // your script here, this will be called when a message is sent
}

function onReact({ api, message, getLang, db, controllers, eventData }) {
    // your script here, this will be called when a message is sent
}

function onReply({ api, message, getLang, db, controllers, eventData }) {
    // your script here, this will be called when a message is sent
}


export const scripts = {
    commands: {
        exampleCommand,
        another_exampleCommand
    },
    onMessage,
    onReact,
    onReply
}
