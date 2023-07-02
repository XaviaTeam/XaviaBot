const langData = {
    en_US: {
        warn: "[ WARN ] Please don't spam!",
        limit: "You have been kicked out of the group due to spamming!",
    },
    vi_VN: {
        warn: "[ CẢNH CÁO ] Vui lòng không spam!",
        limit: "Bạn đã bị kick khỏi nhóm vì spam!",
    },
    ar_SY: {
        warn: "[ انـذار] من فضلك توقف عن الازعاج والرسائل الطويلة!",
        limit: "سيتم طردك من المجموعة لارسال رسائل مزعجة وتخطيك الحدود!",
    },
};

const _1Sec = 1000;
const _10Sec = _1Sec * 10;
const _1Day = _1Sec * 60 * 60 * 24;
const _1Week = _1Day * 7;
const _FAST_REDUCE_INTERVAL = _10Sec;
const _MIN_TIME_BETWEEN = _1Sec * 2;

const onLoad = () => {
    if (!global.hasOwnProperty("messageCount")) global.messageCount = [];

    setInterval(() => {
        global.messageCount.forEach((e) => {
            e.members.forEach((e) => {
                if (e.fast > 0) e.fast--;
                else if (e.fast < 0) e.fast = 0;
            });
        });
    }, _FAST_REDUCE_INTERVAL);
};

// @TODO
// - Better spam detection
const isSpam = (memberData, preTime, argsLength, msg, atmLength) => {
    let msgLength = msg.length;

    let timeBetween = Date.now() - preTime;
    if (timeBetween > _MIN_TIME_BETWEEN) return 0;

    if (memberData.countA.length >= 2) {
        if (atmLength > 6 && atmLength <= 12) {
            return 2;
        } else if (atmLength > 12) {
            return 4;
        } else return 1;
    }

    if (memberData.count >= 2) {
        if (argsLength <= 20 || msgLength <= 100) {
            return 1;
        } else if (
            (argsLength > 20 && argsLength <= 40) ||
            (msgLength > 100 && msgLength <= 200)
        ) {
            return 2;
        } else if (
            (((argsLength > 20 && argsLength <= 40) ||
                (msgLength > 100 && msgLength <= 200)) &&
                timeBetween <= _1Sec / 2) ||
            (argsLength > 40 && argsLength <= 60) ||
            (msgLength > 200 && msgLength <= 300)
        ) {
            return 3;
        } else {
            return 4;
        }
    }
};

const onCall = ({ message, getLang, data }) => {
    if (!data?.thread?.data?.antiSettings?.antiSpam) return;
    if (!message.isGroup) return;
    if (!data?.thread?.info?.adminIDs?.some((e) => e == global.botID)) return;

    const { senderID, threadID } = message;
    if (!data.thread.data.hasOwnProperty("spamWarn"))
        data.thread.data.spamWarn = [];
    if (!data.thread.data.spamWarn.some((e) => e.id == message.senderID))
        data.thread.data.spamWarn.push({ id: senderID, count: [] });

    const spamWarnIndex = data.thread.data.spamWarn.findIndex(
        (e) => e.id == senderID
    );
    const spamWarn = data.thread.data.spamWarn[spamWarnIndex];
    if (!spamWarn) return;

    spamWarn.count = spamWarn.count.filter((e) => e >= Date.now() - _1Week);

    if (senderID == global.botID) return;
    if (!global.messageCount.some((e) => e.threadID == threadID))
        global.messageCount.push({ threadID, members: [] });
    if (
        !global.messageCount
            .find((e) => e.threadID == threadID)
            .members.some((e) => e.id == senderID)
    )
        global.messageCount
            .find((e) => e.threadID == threadID)
            .members.push({
                id: senderID,
                count: 0,
                countA: [],
                lastTime: 0,
                fast: 0,
            });

    const threadData = global.messageCount.find((e) => e.threadID == threadID);
    const memberData = threadData.members.find((e) => e.id == senderID);

    let preTime = memberData.lastTime;

    if (message.attachments.length > 0)
        memberData.countA.push(message.attachments.length);
    else memberData.count++;

    memberData.lastTime = Date.now();

    let msgNewLine = (message.body.match(/\n/g) || []).length;
    let avgLineLength = message.body.length / msgNewLine;

    if (memberData >= 60 || (msgNewLine >= 40 && avgLineLength <= 3))
        memberData.fast += 12;
    else if (msgNewLine >= 40 || (msgNewLine >= 20 && avgLineLength <= 3))
        memberData.fast += 5;
    else if (msgNewLine >= 20) memberData.fast += 3;
    else if (msgNewLine >= 10 && avgLineLength <= 3) memberData.fast += 2;

    if (memberData.count < 2 && memberData.countA.length < 2) return;
    let isMemberSpam = isSpam(
        memberData,
        preTime,
        message.args.length,
        message.body,
        message.attachments.length
    );

    if (memberData.count >= 2) memberData.count = 1;
    if (memberData.countA.length >= 2)
        memberData.countA = [memberData.countA[memberData.countA.length - 1]];

    memberData.lastTime = Date.now();
    memberData.fast += isMemberSpam;

    if (memberData.fast >= 12) {
        global.messageCount.find((e) => e.threadID == threadID).members =
            global.messageCount
                .find((e) => e.threadID == threadID)
                .members.filter((e) => e.id != senderID);

        spamWarn.count.push(Date.now());
        message.reply(getLang("warn"));

        if (spamWarn.count.length >= 3) {
            message.reply(getLang("limit"));
            global.api.removeUserFromGroup(senderID, threadID, (err) =>
                console.error(err)
            );
        }
    }
};

export default {
    onLoad,
    langData,
    onCall,
};
