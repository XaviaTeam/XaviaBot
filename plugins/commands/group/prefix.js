const config = {
    aliases: ["pf", "setprefix", "setpf"],
    permissions: [1, 2],
    description: "Set prefix for group",
    usage: "<prefix>",
    cooldown: 5,
    credits: "XaviaTeam",
};

const langData = {
    "en_US": {
        "prefix.get": "Default prefix: {default}\nCurrent prefix: {current}",
        "prefix.set": "Prefix has been set to {newPrefix}",
        "prefix.tooLong": "Prefix must be less than 5 characters",
        "notGroup": "This command only works in group",
        "threadDataNotExists": "Thread data not exists",
    },
    "vi_VN": {
        "prefix.get": "Prefix mặc định: {default}\nPrefix hiện tại: {current}",
        "prefix.set": "Prefix đã được đặt thành {newPrefix}",
        "prefix.tooLong": "Prefix phải ít hơn 5 ký tự",
        "notGroup": "Lệnh này chỉ hoạt động trong nhóm",
        "threadDataNotExists": "Dữ liệu nhóm không tồn tại",
    },
    "ar_VN": {
        "prefix.get": "بادئة افتراضية: {default}\nالبادئة الحالية: {current}",
        "prefix.set": "تم تعيين البادئة على {newPrefix}",
        "prefix.tooLong": "يجب أن تكون البادئة أقل من 5 أحرف",
        "notGroup": "هذا الأمر يعمل فقط في المجموعة",
        "threadDataNotExists": "بيانات المجموعة غير موجودة",
    },
};

/** @type {TOnCallCommand} */
async function onCall({ message, args, data, getLang, prefix }) {
    const { isGroup, threadID } = message;
    const { thread } = data;

    if (!isGroup) return message.reply(getLang("notGroup"));
    if (thread == null) return message.reply(getLang("threadDataNotExists"));
    if (typeof thread.data != "object") thread.data = {};

    if (!args[0])
        return message.reply(
            getLang("prefix.get", {
                default: global.config.PREFIX,
                current: prefix,
            })
        );

    const newPrefix = args[0];
    if (newPrefix.length > 5) return message.reply(getLang("prefix.tooLong"));

    await global.controllers.Threads.updateData(threadID, {
        prefix: newPrefix,
    });
    global.api.changeNickname(
        `[ ${newPrefix} ] ${global.config.NAME || "Xavia"}`,
        threadID,
        global.botID,
        (_) => {
            message.reply(getLang("prefix.set", { newPrefix }));
        }
    );
}

export default {
    config,
    langData,
    onCall,
};
