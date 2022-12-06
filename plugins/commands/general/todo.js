const config = {
    name: "todo",
    description: "List of things to do",
    usage: "[add|remove|list] [todo|index]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam"
}

const langData = {
    "en_US": {
        "dataNotReady": "Data is not ready, please try again later!",
        "missingTodo": "Missing todo!",
        "limitTodo": "You can only add up to 10 todos!",
        "addedTodo": "Added todo:\n{todo}",
        "missingIndex": "Missing index or index is invalid!",
        "removedTodo": "Removed todos with index:\n{indexs}",
        "noTodo": "You have no todos!",
        "listTodo": "List of todos:\n{list}",
        "error": "An error occurred, please try again later!"
    },
    "vi_VN": {
        "dataNotReady": "Dữ liệu chưa sẵn sàng, vui lòng thử lại sau!",
        "missingTodo": "Thiếu todo!",
        "limitTodo": "Bạn chỉ có thể thêm tối đa 10 todos!",
        "addedTodo": "Đã thêm todo:\n{todo}",
        "missingIndex": "Thiếu index hoặc index không hợp lệ!",
        "removedTodo": "Đã xóa todos với index:\n{indexs}",
        "noTodo": "Bạn chưa có todos!",
        "listTodo": "Danh sách todos:\n{list}",
        "error": "Đã xảy ra lỗi, vui lòng thử lại sau!"
    },
    "ar_SY": {
        "dataNotReady": "البيانات ليست جاهزة ، يرجى المحاولة مرة أخرى في وقت لاحق!",
        "missingTodo": "المهام مفقودة!",
        "limitTodo": "يمكنك فقط إضافة ما يصل إلى 10 مهام!",
        "addedTodo": "اضافة مهمة:\n{todo}",
        "missingIndex": "الفهرس أو الفهرس المفقود غير صالح!",
        "removedTodo": "إزالة المهام مع الفهرس:\n{indexs}",
        "noTodo": "ليس لديك مهام!",
        "listTodo": "قائمة المهام:\n{list}",
        "error": "لقد حدث خطأ، رجاء أعد المحاولة لاحقا!"
    }
}

async function onCall({ message, args, getLang, data }) {
    try {
        const input = args[0]?.toLowerCase();
        const { user } = data;

        if (!user?.data) return message.reply(getLang("dataNotReady"));

        if (input == "add") {
            const todo = args.slice(1).join(" ")
            if (!todo) return message.reply(getLang("missingTodo"));
            if (user.data?.todo >= 10) return message.reply(getLang("limitTodo"));

            const _todo = user.data.todo || [];
            _todo.push(todo);

            await global.controllers.Users.updateData(message.senderID, { todo: _todo });
            return message.reply(getLang("addedTodo", { todo }));
        } else if (input == "remove") {
            const _todo = user.data.todo || [];

            const indexs = args.slice(1).map(e => parseInt(e)).filter(e => !isNaN(e) && e > 0 && e <= _todo.length);
            if (!indexs.length) return message.reply(getLang("missingIndex"));

            indexs.sort((a, b) => b - a);

            for (const index of indexs) {
                _todo.splice(index - 1, 1);
            }

            await global.controllers.Users.updateData(message.senderID, { todo: _todo });
            return message.reply(getLang("removedTodo", { indexs: indexs.sort().join(", ") }));
        } else {
            const _todo = user.data.todo || [];
            if (!_todo.length) return message.reply(getLang("noTodo"));

            const list = _todo.map((e, i) => `${i + 1}. ${e}`).join("\n");
            return message.reply(getLang("listTodo", { list }));
        }
    } catch (e) {
        console.error(e);
        return message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}
