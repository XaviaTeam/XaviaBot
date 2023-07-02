const config = {
    name: "safebooru",
    aliases: ["sb"],
    description: "Get images from safebooru",
    version: "0.0.1-beta",
    usage: "[tag]",
    cooldown: 5,
    permissions: [0, 1, 2],
    credits: "XaviaTeam",
};

async function onCall({ message, args }) {
    try {
        await message.react("⏳");

        const tags = args.join("_");

        if (!tags) return message.reply("Please enter a tag to search for.");

        const data = await global
            .GET(
                `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=100&tags=${encodeURIComponent(
                    tags
                )}`
            )
            .then((r) => r.data)
            .catch((err) => {
                console.log(err);
                return null;
            });

        if (data.length === 0 || data === null)
            throw new Error(`No results found or error for: ${tags}`);

        const filteredData = data.filter(
            (e) =>
                e.image.endsWith(".jpg") ||
                e.image.endsWith(".png") ||
                e.image.endsWith(".jpeg")
        );

        if (filteredData.length === 0)
            return message.reply("No results found.");

        global.shuffleArray(filteredData);

        const imgStreams = [];

        for (let i = 0; i < 9; i++) {
            const img = filteredData[i];
            imgStreams.push(
                await global.getStream(getImageUrl(img.directory, img.image))
            );
        }

        await message.reply({ attachment: imgStreams });
        await message.react("✅");
    } catch (e) {
        console.error(e);
        return message.reply(
            "Error, please try again later or contact the developer."
        );
    }
}

function getImageUrl(directory, image) {
    return `https://safebooru.org/images/${directory}/${image}`;
}

export default {
    config,
    onCall,
};
