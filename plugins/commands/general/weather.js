const config = {
    name: "weather",
    description: "Get weather info",
    usage: "[location]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "xaviaTeam"
}

const langData = {
    "vi_VN": {
        "missingInput": "Vui lòng nhập địa điểm",
        "notFound": "Không tìm thấy địa điểm",
        "results": "Thời tiết tại {name}:\nNhiệt độ: {temperture}°C\nThời gian: {day}, {date}\nThời gian quan sát: {observationtime}\nĐiểm quan sát: {observationpoint}\nTrạng thái: {skytext}\nTốc độ gió: {windspeed}\nĐộ ẩm: {humidity}",
        "error": "Đã xảy ra lỗi"
    },
    "en_US": {
        "missingInput": "Please enter a location",
        "notFound": "Location not found",
        "results": "Weather at {name}:\nTemperature: {temperture}°C\nTime: {day}, {date}\nObservation time: {observationtime}\nObservation point: {observationpoint}\nSky status: {skytext}\nWind speed: {windspeed}\nHumidity: {humidity}",
        "error": "An error has occurred"
    },
    "ar_SY": {
        "missingInput": "الرجاء إدخال موقع",
        "notFound": "الموقع غير موجود",
        "results": "الطقس في {name}:\nدرجة الحرارة: {temperture}°C\الوقت: {day}, {date}\وقت المراقبة: {observationtime}\nنقطة المراقبة: {observationpoint}\nحالة السماء: {skytext}\nسرعة الريح: {windspeed}\nالرطوبة: {humidity}",
        "error": "حدث خطأ"
    }
}

async function onCall({ message, args, getLang }) {
    try {
        const input = args[0]?.toLowerCase();
        if (input?.length == 0) return message.reply(getLang("missingInput"));

        global
            .GET(`${global.xva_api.popcat}/weather?q=${input}`)
            .then(res => {
                const current = res.data[0]?.current;
                const location = res.data[0]?.location;

                if (!current || !location) return message.reply(getLang("notFound"));

                return message.reply(getLang("results", {
                    name: location.name,
                    temperture: current.temperature,
                    day: current.day,
                    date: current.date,
                    observationtime: current.observationtime,
                    observationpoint: current.observationpoint,
                    skytext: current.skytext,
                    windspeed: current.windspeed,
                    humidity: current.humidity
                }))
            })
            .catch(e => {
                console.error(e);
                message.reply(getLang("error"));
            });
    } catch (e) {
        console.error(e);
        message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}
