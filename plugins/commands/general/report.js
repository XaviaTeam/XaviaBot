const config = {
    name: "report",
    description: "report to mods",
    usage: "[text/attachment/reply]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam",
};

const langData = {
    vi_VN: {
        report_no_content:
            "Bạn chưa nhập/reply tin nhắn nào để report hoặc file đính kèm không được hỗ trợ!",
        report_content:
            "📢 Báo cáo từ {reporterName} ({senderID})\n📌 Thread: {reporterThreadName} ({threadID})\n📝 Nội dung:\n{content}",
        report_failed: "Gửi báo cáo thất bại, vui lòng thử lại sau!",
        report_success: "Đã gửi báo cáo đến {reportSuccess} quản trị bot!",
        not_mod: "Bạn không phải là quản trị viên của bot!",
        reply_content:
            "📬 Phản hồi từ {senderName} ({senderID})\n📝 Nội dung:\n{content}",
        error: "Đã có lỗi xảy ra, vui lòng thử lại sau!",
    },
    en_US: {
        report_no_content:
            "You have not entered/replied any message to report or the attached file is not supported!",
        report_content:
            "📢 Report from {reporterName} ({senderID})\n📌 Thread: {reporterThreadName} ({threadID})\n📝 Content:\n{content}",
        report_failed: "Sending report failed, please try again later!",
        report_success: "Report sent to {reportSuccess} bot admin!",
        not_mod: "You are not a bot admin!",
        reply_content:
            "📬 Reply from {senderName} ({senderID})\n📝 Content:\n{content}",
        error: "An error has occurred, please try again later!",
    },
    ar_SY: {
        report_no_content:
            "لم تقم بإدخال / الرد على أي رسالة للإبلاغ أو أن الملف المرفق غير مدعوم!",
        report_content:
            "📢 تقرير من {reporterName} ({senderID})\n📌 Thread: {reporterThreadName} ({threadID})\n📝 Content:\n{content}",
        report_failed: "فشل إرسال التقرير ، يرجى المحاولة مرة أخرى لاحقًا!",
        report_success: "تم إرسال التقرير إلى {reportSuccess} ادمن البوت",
        not_mod: "انت لست ادمن البوت!",
        reply_content:
            "📬 الرد من {senderName} ({senderID})\n📝 Content:\n{content}",
        error: "حصل خطأ. الرجاء المحاوله مرة اخرى!",
    },
};

const supportedAttachments = ["photo", "animated_image", "video", "audio"];

function errHandler(err) {
    console.error(err);
    return null;
}

async function save(attachment) {
    try {
        let ext =
            attachment.type == "photo"
                ? "jpg"
                : attachment.type == "animated_image"
                ? "gif"
                : attachment.type == "video"
                ? "mp4"
                : "mp3";
        let dlPath = `${global.cachePath}/report_${attachment.ID}.${ext}`;

        await global.downloadFile(dlPath, attachment.url);
        return dlPath;
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function UserCallback({ message, getLang, eventData, data }) {
    try {
        const { senderID, messageID, threadID } = message;

        const attachments = (message.attachments || []).filter(
            (attachment) =>
                attachment && supportedAttachments.includes(attachment.type)
        );
        const isAttachmentAvailable = attachments.length > 0;

        const content = message.body || "";
        const isContentAvailable = content && content.length > 0;

        if (!isContentAvailable && !isAttachmentAvailable)
            return message.reply(getLang("report_no_content"));

        let reporterID = senderID;
        let reporterName = data?.user?.info?.name || reporterID;

        let saved = [];
        if (isAttachmentAvailable) {
            for (const attachment of attachments) {
                const savePath = await save(attachment).catch(errHandler);
                if (!savePath) continue;

                saved.push(savePath);
            }
        }

        let reportData = {
            body: getLang("reply_content", {
                content,
                senderName: reporterName,
                senderID: reporterID,
            }),
            mentions: [
                {
                    tag: reporterName,
                    id: reporterID,
                },
            ],
            attachment: saved.map((path) => global.reader(path)),
        };

        let reportStatus = await message
            .send(
                reportData,
                eventData.repliedThreadID,
                eventData.repliedMessageID
            )
            .then((data) => data)
            .catch(errHandler);

        if (!reportStatus) await message.react("❌");
        else {
            reportStatus.addReplyEvent({
                reportedMessageID: messageID,
                reportedThreadID: threadID,
                callback: ModsCallback,
                author_only: false,
            });
            message.react("✅");
        }

        for (const path of saved) {
            try {
                global.deleteFile(path);
            } catch (e) {
                errHandler(e);
            }
        }
    } catch (e) {
        console.error(e);
        message.reply(getLang("error"));
    }
}

async function ModsCallback({ message, getLang, eventData, data }) {
    try {
        const { senderID, messageID, threadID } = message;
        const isValidMod = global.config.MODERATORS.some(
            (id) => id == senderID
        );

        if (!isValidMod) return message.reply(getLang("not_mod"));
        const attachments = (message.attachments || []).filter(
            (attachment) =>
                attachment && supportedAttachments.includes(attachment.type)
        );
        const isAttachmentAvailable = attachments.length > 0;

        const content = message.body || "";
        const isContentAvailable = content && content.length > 0;

        if (!isContentAvailable && !isAttachmentAvailable)
            return message.reply(getLang("report_no_content"));

        let modID = senderID;
        let modName = data?.user?.info?.name || modID;

        let saved = [];
        if (isAttachmentAvailable) {
            for (const attachment of attachments) {
                const savePath = await save(attachment).catch(errHandler);
                if (!savePath) continue;

                saved.push(savePath);
            }
        }

        let reportData = {
            body: getLang("reply_content", {
                content,
                senderName: modName,
                senderID: modID,
            }),
            mentions: [
                {
                    tag: modName,
                    id: modID,
                },
            ],
            attachment: saved.map((path) => global.reader(path)),
        };

        if (!reportData.body && reportData.attachment?.length == 0)
            return message.reply(getLang("report_no_content"));

        const replyStatus = await message
            .send(
                reportData,
                eventData.reportedThreadID,
                eventData.reportedMessageID
            )
            .then((data) => data)
            .catch(errHandler);

        if (replyStatus) {
            replyStatus.addReplyEvent({
                repliedMessageID: messageID,
                repliedThreadID: threadID,
                callback: UserCallback,
                author_only: false,
            });
            await message.react("✅");
        } else await message.react("❌");

        for (const path of saved) {
            try {
                global.deleteFile(path);
            } catch (e) {
                errHandler(e);
            }
        }
    } catch (e) {
        console.error(e);
        message.reply(getLang("error"));
    }
}

async function onCall({ message, args, getLang, data }) {
    try {
        const { messageReply, senderID, threadID } = message;

        const content = args.join(" ") || messageReply?.body || "";
        const attachments = (
            messageReply?.attachments ||
            message.attachments ||
            []
        ).filter(
            (attachment) =>
                attachment && supportedAttachments.includes(attachment.type)
        );

        const isContentAvailable = content && content.length > 0;
        const isAttachmentAvailable = attachments.length > 0;

        if (!isContentAvailable && !isAttachmentAvailable)
            return message.reply(getLang("report_no_content"));

        let reporterName = data?.user?.info?.name || senderID;
        let reporterThreadName = data?.thread?.info?.name || threadID;

        let reportData = {
            body: getLang("report_content", {
                reporterName,
                senderID,
                reporterThreadName,
                threadID,
                content,
            }),
            mentions: [
                {
                    tag: reporterName,
                    id: senderID,
                },
            ],
        };

        let saved = [];
        if (isAttachmentAvailable) {
            for (const attachment of attachments) {
                const savePath = await save(attachment).catch(errHandler);
                if (!savePath) continue;

                saved.push(savePath);
            }
        }

        if (!reportData.body && reportData.attachment?.length == 0)
            return message.reply(getLang("report_no_content"));

        let reportSuccess = 0;

        for (const id of global.config.MODERATORS) {
            if (!id) continue;
            let reportStatus = await message
                .send(
                    {
                        body: reportData.body,
                        mentions: reportData.mentions,
                        attachment: saved.map((e) => global.reader(e)) || [],
                    },
                    String(id)
                )
                .then((data) => data)
                .catch(errHandler);

            if (reportStatus) {
                reportSuccess++;
                reportStatus.addReplyEvent({
                    reportedThreadID: threadID,
                    reportedMessageID: message.messageID,
                    callback: ModsCallback,
                    author_only: false,
                });
            }
            await global.utils.sleep(300);
        }

        if (reportSuccess == 0) await message.reply(getLang("report_failed"));
        else await message.reply(getLang("report_success", { reportSuccess }));

        for (const path of saved) {
            try {
                global.deleteFile(path);
            } catch (e) {
                errHandler(e);
            }
        }
    } catch (e) {
        console.error(e);
        return message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall,
};
