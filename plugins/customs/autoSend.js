import cron from 'node-cron'

// learn more about cron time here:
// https://www.npmjs.com/package/node-cron?activeTab=readme
const jobs = [
    {
        time: "0 22 * * *", // every day at 22:00 (10 PM)
        message: () => "It's 10 PM, good night!"
    }
]

export default function autoSend() {
    const timezone = global.config?.timezone || "Asia/Ho_Chi_Minh";
    if (!timezone) return;

    for (const job of jobs) {
        cron.schedule(job.time, () => {
            let i = 0;
            for (const [tid] of global.data.threads || []) {
                setTimeout(() => {
                    global.api.sendMessage({
                        body: job.message()
                    }, tid);
                }, (i++) * 300)
            }
        }, {
            timezone: timezone
        })
    }
}
