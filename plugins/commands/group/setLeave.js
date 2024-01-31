import { join } from "path";

const config = {
    name: "setleave",
    description: "set leave message/gif",
    usage: "[text/reply/help]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "en_US": {
        "help": "Usage: setleave [text/reply/help]\n\nExample: setleave Goodbye {leftName}! We will miss you!",
        "noContent": "Please enter/reply the message/gif you want to set!",
        "success": "Set leave message/gif successfully!",
        "error": "An error occurred, please try again!",
        "errorGif": "An error occurred while downloading the gif, please try again!",
        "attachmentShouldBeGif": "The attachment should be a gif!",
        "deleted": "Deleted leave message/gif successfully!"
    },
    "vi_VN": {
        "help": "Sử dụng: setleave [text/reply/help]\n\nVí dụ: setleave Tạm biệt {leftName}! Chúng tôi sẽ nhớ bạn!",
        "noContent": "Vui lòng nhập/trả lời tin nhắn/gif bạn muốn đặt!",
        "success": "Đặt tin nhắn/gif chào tạm biệt thành công!",
        "error": "Đã xảy ra lỗi, vui lòng thử lại!",
        "errorGif": "Đã xảy ra lỗi khi tải gif, vui lòng thử lại!",
        "attachmentShouldBeGif": "Tệp đính kèm phải là một gif!",
        "deleted": "Đã xóa tin nhắn/gif chào tạm biệt thành công!"
    },
    "ar_SY": {
        "help": "إستعمال: setleave [text/reply/help]\n\nمثال: setleave مع السلامة {leftName}! سنفتقدك!",
        "noContent": "الرجاء إدخال/الرد على الرسالة/gif التي تريد تعيينها!",
        "success": "تعيين رسالة الخروج/gif بنجاح!",
        "error": "حدث خطأ ، يرجى المحاولة مرة أخرى!",
        "errorGif": "حدث خطأ أثناء تنزيل ملف gif ، يرجى المحاولة مرة أخرى!",
        "attachmentShouldBeGif": "يجب أن يكون المرفق صورة gif!",
        "deleted": "تم حذف رسالة الخروج/gif بنجاح!"
    }
}

function ensureExits() {
    if (global.utils.isExists(join(global.pluginsPath, "events", "unsubscribeGifs"), "dir")) return;
    global.createDir(join(global.pluginsPath, "events", "unsubscribeGifs"));
}

function deleteThreadGif(threadID) {
    return new Promise(async (resolve, reject) => {
        try {
            const gifPath = `${global.mainPath}/plugins/events/unsubscribeGifs/${threadID}.gif`;
            if (global.isExists(gifPath)) {
                global.deleteFile(gifPath);
            }
            resolve(true);
        } catch (e) {
            console.error(e);
            reject(false);
        }
    });
}

function downloadGif(threadID, url) {
    return new Promise(async (resolve, reject) => {
        try {
            await global.downloadFile(`${global.mainPath}/plugins/events/unsubscribeGifs/${threadID}.gif`, url);
            resolve(true);
        } catch (e) {
            console.error(e);
            reject(false);
        }
    });
}

async function onCall({ message, getLang, args, data }) {
    if (!message.isGroup) return;
    const { messageReply, threadID, reply, attachments } = message;
    const { Threads } = global.controllers;
    try {
        ensureExits();
        if (args[0] == "help")
            return reply(getLang("help"));

        if (args[0] == "del" || args[0] == "delete") {
            data.leaveMessage = null;
            await Threads.updateData(threadID, { leaveMessage: null });
            await deleteThreadGif(threadID);
            return reply(getLang("deleted"));
        }

        const leaveMessage = args.join(" ") || messageReply.body;
        const leaveAttachment = (messageReply?.attachments || attachments)[0];

        if (!leaveMessage && !leaveAttachment) return reply(getLang("noContent"));
        if (leaveMessage) {
            await Threads.updateData(threadID, { leaveMessage });
        }

        if (leaveAttachment) {
            if (leaveAttachment.type == "animated_image") {
                try {
                    await downloadGif(threadID, leaveAttachment.url);
                } catch (e) {
                    await reply(getLang("errorGif"));
                }
            } else {
                await reply(getLang("attachmentShouldBeGif"));
            }

        } else {
            await deleteThreadGif(threadID);
        }

        return reply(getLang("success"));
    } catch (e) {
        console.error(e);
        return reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}
