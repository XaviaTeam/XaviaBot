import { join } from "path";

const config = {
    name: "setjoin",
    description: "set join message/gif",
    usage: "[text/reply/help]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "en_US": {
        "help": "Usage: setjoin [text/reply/help]\n\nExample: setjoin Welcome {members} to {threadName}!\nYou are {newCount} member!",
        "noContent": "Please enter/reply the message/gif you want to set!",
        "success": "Set join message/gif successfully!",
        "error": "An error occurred, please try again!",
        "errorGif": "An error occurred while downloading the gif, please try again!",
        "attachmentShouldBeGif": "The attachment should be a gif!",
        "deleted": "Deleted join message/gif successfully!"
    },
    "vi_VN": {
        "help": "Sử dụng: setjoin [text/reply/help]\n\nVí dụ: setjoin Chào mừng {members} đến với {threadName}!\n(Các) bạn là thành viên thứ {newCount}!",
        "noContent": "Vui lòng nhập/trả lời tin nhắn/gif bạn muốn đặt!",
        "success": "Đặt tin nhắn/gif chào mừng thành công!",
        "error": "Đã xảy ra lỗi, vui lòng thử lại!",
        "errorGif": "Đã xảy ra lỗi khi tải gif, vui lòng thử lại!",
        "attachmentShouldBeGif": "Tệp đính kèm phải là một gif!",
        "deleted": "Đã xóa tin nhắn/gif chào mừng thành công!"
    },
    "ar_SY": {
        "help": "إستعمال: setjoin [text/reply/help]\n\nمثال: setjoin أهلا وسهلا {members} الى {threadName}!\nانت {newCount} عضو جديد!",
        "noContent": "الرجاء إدخال / الرد على الرسالة/gif تريد أن تضع!",
        "success": "تعيين رسالة الانضمام/gif بنجاح!",
        "error": "حدث خطأ ، يرجى المحاولة مرة أخرى!",
        "errorGif": "حدث خطأ أثناء تنزيل ملف gif ، يرجى المحاولة مرة أخرى!",
        "attachmentShouldBeGif": "يجب أن يكون المرفق صورة gif!",
        "deleted": "تم حذف رسالة الانضمام /gif بنجاح!"
    }
}

function ensureExits() {    
    if (global.utils.isExists(join(global.pluginsPath, "events", "subscribeGifs"), "dir")) return;
    global.createDir(join(global.pluginsPath, "events", "subscribeGifs"));
}

function deleteThreadGif(threadID) {
    return new Promise(async (resolve, reject) => {
        try {
            const gifPath = `${global.mainPath}/plugins/events/subscribeGifs/${threadID}.gif`;
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
            await global.downloadFile(`${global.mainPath}/plugins/events/subscribeGifs/${threadID}.gif`, url);
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
            data.joinMessage = null;
            await Threads.updateData(threadID, { joinMessage: null });
            await deleteThreadGif(threadID);
            return reply(getLang("deleted"));
        }

        const joinMessage = args.join(" ") || messageReply.body;
        const joinAttachment = (messageReply?.attachments || attachments)[0];

        if (!joinMessage && !joinAttachment) return reply(getLang("noContent"));
        if (joinMessage) {
            await Threads.updateData(threadID, { joinMessage });
        }

        if (joinAttachment) {
            if (joinAttachment.type == "animated_image") {
                try {
                    await downloadGif(threadID, joinAttachment.url);
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
