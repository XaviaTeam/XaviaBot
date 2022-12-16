const config = {
    name: "rules",
    aliases: ["rule"],
    description: "Setting rules for group",
    usage: "[add/remove] [rule]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "vi_VN": {
        "dataNotReady": "Dữ liệu chưa sẵn sàng",
        "noPermission": "Bạn không có đủ quyền hạn thực hiện lệnh này",
        "noRule": "Bạn chưa nhập nội dung",
        "ruleExists": "Luật này đã tồn tại",
        "addedRule": "Đã thêm luật mới:\n{rule} (#{addedRuleIndex})",
        "missingIndexes": "Bạn chưa nhập số thứ tự luật cần xóa hoặc số thứ tự không hợp lệ",
        "confirmRemove": "React 👍 để xác nhận xóa luật thứ: {indexes}",
        "removedRules": "Đã xóa thành công!",
        "noRules": "Không có luật nào được thiết lập",
        "rules": "Luật của nhóm:\n{rules}",
        "error": "Đã có lỗi xảy ra"
    },
    "en_US": {
        "dataNotReady": "Data is not ready",
        "noPermission": "You don't have enough permissions to use this",
        "noRule": "You haven't entered any content",
        "ruleExists": "This rule already exists",
        "addedRule": "Added new rule:\n{rule} (#{addedRuleIndex})",
        "missingIndexes": "You haven't entered the rule index to delete or the index is invalid",
        "confirmRemove": "React 👍 to confirm removing rule: {indexes}",
        "removedRules": "Removed successfully!",
        "noRules": "No rules have been set",
        "rules": "Group rules:\n{rules}",
        "error": "An error has occurred"
    },
    "ar_SY": {
        "dataNotReady": "البيانات ليست جاهزة",
        "noPermission": "ليس لديك صلاحيات كافية لاستخدام هذا",
        "noRule": "لم تدخل أي محتوى",
        "ruleExists": "هذه القاعدة موجودة بالفعل",
        "addedRule": "تمت إضافة قاعدة جديدة:\n{rule} (#{addedRuleIndex})",
        "missingIndexes": "لم تدخل فهرس القاعدة للحذف أو أن الفهرس غير صالح",
        "confirmRemove": "تفاعل ب 👍 لتأكيد إزالة القاعدة: {indexes}",
        "removedRules": "تمت الإزالة بنجاح!",
        "noRules": "لم يتم وضع قواعد",
        "rules": "قواعد المجموعة:\n{rules}",
        "error": "حدث خطأ"
    }
}

async function confirm({ message, data, getLang, eventData }) {
    try {
        const { reaction } = message;
        if (reaction != "👍") return;

        const threadRules = data?.thread?.data?.rules;
        if (!threadRules) return message.send(getLang("error"));

        const { indexesToRemove } = eventData;

        for (const index of indexesToRemove) threadRules.splice(index, 1);

        await global.controllers.Threads.updateData(message.threadID, { rules: threadRules });

        return message.send(getLang("removedRules"));
    } catch (err) {
        console.error(err);
        message.send(getLang("error"));
    }
}

async function onCall({ message, args, getLang, data, userPermissions }) {
    try {
        const thread = data?.thread;
        if (!thread) return message.reply(getLang("dataNotReady"));

        const threadData = thread.data || {};
        const threadRules = threadData.rules || [];

        const isGroupAdmin = userPermissions.some(p => p == 1);
        const query = args[0]?.toLowerCase();

        if (query == "add") {
            if (!isGroupAdmin) return message.reply(getLang("noPermission"));

            const rule = args.slice(1).join(" ");
            if (!rule) return message.reply(getLang("noRule"));
            if (threadRules.includes(rule)) return message.reply(getLang("ruleExists"));

            await global.controllers.Threads.updateData(message.threadID, { rules: [...threadRules, rule] });

            const addedRuleIndex = threadRules.length + 1;
            return message.reply(getLang("addedRule", { rule, addedRuleIndex }));

        } else if (query == "remove") {
            if (!isGroupAdmin) return message.reply(getLang("noPermission"));

            const indexesToRemove =
                args.slice(1)
                    .filter(a => a && !isNaN(a) && a > 0 && a <= threadRules.length)
                    .map(a => parseInt(a) - 1);

            if (indexesToRemove.length == 0) return message.reply(getLang("missingIndexes"));

            return message
                .reply(getLang("confirmRemove", { indexes: indexesToRemove.map(i => i + 1).join(", ") }))
                .then(_ => _.addReactEvent({ callback: confirm, indexesToRemove }))
                .catch(e => {
                    if (e.message) {
                        console.error(e.message);
                        message.reply(getLang("error"));
                    }
                });
        } else {
            if (threadRules.length == 0) return message.reply(getLang("noRules"));

            return message.reply(getLang("rules", { rules: threadRules.map((r, i) => `${i + 1}. ${r}`).join("\n") }));
        }
    } catch (err) {
        console.error(err);
        message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}
