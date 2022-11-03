const config = {
    name: "restart",
    aliases: ["rs", "rest", "reboot"],
    permissions: [2]
}

async function onCall({ message, getLang }) {
    await message.reply("Restarting...");
    global.restart();
}

export default {
    config,
    onCall
}
