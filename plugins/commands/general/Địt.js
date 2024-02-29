export const config = {
    name: "địt",
    version: "0.0.1-xaviabot-port-refactor",
    credits: "đã xoá",
    description: "địt ai đó",
    usage: "[Chjch ai đó]",
    cooldown: 5,
    permissions: [2],
    isAbsolute: true,
};

export async function onCall({ message }) {
    const { reply, mentions, react } = message;

    if (!mentions || !Object.keys(mentions)[0]) return reply("Please tag someone");

    return GET('https://59cd7ede-fd20-4f24-bb47-6da98c0627eb-00-x2e5zij0x0a2.picard.replit.dev/getlink4')
        .then(async res => {
            let mention = Object.keys(mentions)[0],
                tag = mentions[mention].replace("@", "");

            await react("✅");
            await reply({
                body: "Bị anh chịch sướng không bea~🥵 " + tag,
                mentions: [{
                    tag: tag,
                    id: mention
                }],
                attachment: await global.getStream(res.data.url)
            });
        })
        .catch(err => {
            console.error(err);
            reply("anh đã đóng api hahaha,chịch = mắt :))");
        })
}
