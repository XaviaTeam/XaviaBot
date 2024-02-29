export const config = {
    name: "wikipedia",
    version: "1.0.0",
    credits: "August Quinn",
    description: "Get Wikipedia information.",
    usage: "[page_title]",
    cooldown: 5,
};

export async function onCall({ message, args }) {
    const { reply, react } = message;
    try {
        const pageTitle = encodeURIComponent(args.join(" "));

        if (!pageTitle) {
            return await reply("Kindly provide a page title.");
        }

        await react("⏳");

                const response = await global.GET(`https://wikipedia2.august-api.repl.co/wiki/${pageTitle}`);
                const { title, extract, imageUrl, url, pageId, lastRevision, lastRevisionId } = response.data;

        await react("✅");

        if (!extract) {
            return await reply(`No information found for "${args.join(" ")}".`);
        }

        const msg = {
            body: `📖 Wikipedia Information for "${title}"\n\n𝗧𝗜𝗧𝗟𝗘: ${title}\n𝗖𝗢𝗡𝗧𝗘𝗡𝗧: ${
                extract || "N/A"
            }\n\n𝗜𝗠𝗔𝗚𝗘 𝗨𝗥𝗟: ${imageUrl || "N/A"}\n𝗨𝗥𝗟: ${
                url || "N/A"
            }\n𝗣𝗔𝗚𝗘 𝗜𝗗: ${pageId || "N/A"}\n𝗟𝗔𝗦𝗧 𝗥𝗘𝗩𝗜𝗦𝗜𝗢𝗡: ${
                lastRevision || "N/A"
            }\n𝗟𝗔𝗦𝗧 𝗥𝗘𝗩𝗜𝗦𝗜𝗢𝗡 𝗜𝗗: ${lastRevisionId || "N/A"}`,
        };

        if (imageUrl) {
            const imgStream = await global.getStream("https:" + imageUrl).catch((e) => {
                console.error(e);
                return null;
            });

            if (imgStream != null) msg.attachment = imgStream;
        }

                return await reply(msg);
    } catch (error) {
        console.error("Error fetching Wikipedia information:", error);
        return await reply(
            "An error occurred while fetching Wikipedia information."
        );
    }
}