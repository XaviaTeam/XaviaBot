const config = {
    credits: "XaviaTeam"
}

function onCall({ message }) {
    global.GET(`${global.xva_api.main}/loli`)
        .then(async res => {
            try {
                let imgStream = await global.getStream(res.data.url);
                message.reply({
                    body: res.data.url,
                    attachment: imgStream
                });
            } catch {
                message.reply("Error!");
            }
        })
        .catch(_ => message.reply("Error!"));
}

export default {
    config,
    onCall
}
