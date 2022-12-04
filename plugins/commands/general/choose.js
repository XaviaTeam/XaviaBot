const config = {
    name: "choose",
    usage: "option1 | option2 | option3 | ...",
    description: "Choose one of the options",
    cooldown: 5,
    credits: "XaviaTeam"
}

const langData = {
    "en_US": {
        "choose.atLeast2Options": "At least 2 options are required"
    },
    "vi_VN": {
        "choose.atLeast2Options": "Ít nhất 2 tùy chọn là cần thiết"
    },
    "ar_SY": {
        "choose.atLeast2Options": "هناك حاجة إلى خيارين على الأقل"
    }
}

function onCall({ message, args, getLang }) {
    const options = args.join(" ").split("|");
    if (options.length < 2) return message.reply(getLang("choose.atLeast2Options"));

    const index = global.random(0, options.length - 1);
    message.reply(`⇒ ${options[index]?.trim() || "┐(￣ヘ￣)┌"}`);
}

export default {
    config,
    langData,
    onCall
}
