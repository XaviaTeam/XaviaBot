import { OpenAI } from "openai";

const config = {
    name: "openai",
    version: "0.0.1-beta",
    aliases: ["ai"],
    description: "nói chuyện với ChatGPT hoặc bạn có thể tạo ảnh với nó. ",
    usage: "[prompt]/[reply]/[create] [prompt]",
    cooldown: 3,
    credits: "RFS-ADRENO",
    permissions: [2],
    isAbsolute: true
};

const openaiApi = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

async function onCall({ message, args }) {
    if (!process.env.OPENAI_KEY) {
        return message.reply("The bot owner has not set up this command yet.");
    }

    const isReply = message.type === "message_reply";
    const prompt = args.join(" ");

    if (!prompt && !isReply) {
        return message.reply("Ngu :))");
    }

    const promptText = isReply
        ? prompt + "\n" + message.messageReply.body
        : prompt;

    if (!promptText) {
        return message.reply("Bảo ngu lại tự ái.");
    }

    const isCreate = promptText.startsWith("create ");

    if (isCreate) {
        const imagePrompt = promptText.replace("create ", "");

        openaiApi.images
            .generate({
                prompt: imagePrompt,
                size: "512x512",
                response_format: "url",
            })
            .then(async (res) => {
                await message.reply({
                    attachment: await global.getStream(res.data[0].url),
                });
            })
            .catch((e) => {
                console.error(e.response.data);
                message.reply("An error occurred.");
            });
    } else {
        openaiApi.chat.completions
            .create({
                model: "gpt-3.5-turbo",
                max_tokens: 2000,
                n: 1,
                messages: [
                    {
                        role: "user",
                        content: promptText,
                    },
                ],
            })
            .then(async (res) => {
                try {
                    const parsedContent = (
                        await global.GET(
                            `https://xva-api.up.railway.app/api/extractgpt?content=${encodeURIComponent(
                                res.choices[0].message.content
                            )}&maxCharacterPerLine=6000`
                        )
                    ).data;
                    const result = parsedContent.data.result;

                    for (let i = 0; i < result.length; i++) {
                        await message[i === 0 ? "reply" : "send"](result[i]);

                        global.sleep(300);
                    }
                } catch (e) {
                    console.error(e.response.data);
                    message.reply("An error occurred.");
                }
            })
            .catch((e) => {
                console.error(e.response.data);
                message.reply("An error occurred.");
            });
    }

    return;
}

export default {
    config,
    onCall,
};