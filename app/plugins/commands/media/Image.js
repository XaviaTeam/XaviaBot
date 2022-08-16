export const info = {
    name: "Image",
    about: "Image Provider",
    credits: "Xavia"
}

const xDomain = "https://xaviateam.herokuapp.com";

function getImage(reply, endp) {
    GET(`${xDomain}/${endp}`)
        .then(async res => {
            const { url } = res.data;

            try {
                const imageStream = await getStream(url);
                reply({
                    body: url,
                    attachment: imageStream
                });
            } catch (e) {
                console.error(e);
                reply("Error");
            }

        })
        .catch(e => {
            console.error(e);
            reply("Error")
        });
}

function loli() {
    const config = {
        name: "loli",
        aliases: [],
        version: "1.0.0",
        description: "Get loli image",
        usage: "",
        permissions: 2,
        cooldown: 5
    }

    const onCall = ({ message }) => {
        getImage(message.reply, "loli");

        return;
    }

    return { config, onCall };
}

function wallpaper() {
    const config = {
        name: "wallpaper",
        aliases: ["wallpp", "wpp"],
        version: "1.0.0",
        description: "Get anime wallpaper image",
        usage: "",
        permissions: 2,
        cooldown: 5
    }

    const onCall = ({ message }) => {
        getImage(message.reply, "wallpaper");

        return;
    }

    return { config, onCall };
}

export const scripts = {
    commands: {
        loli,
        wallpaper
    }
}
