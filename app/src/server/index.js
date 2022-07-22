import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import proc from 'process-stats';


export default function (port = 3000, db) {
    const _2HOUR = 1000 * 60 * 60 * 2;
    return new Promise((resolve) => {
        //reload data every 2 hours
        setInterval(async () => {
            client.modules.logger.custom(getLang('server.refreshingStats'), 'REFRESH');
            await updateStats();
        }, _2HOUR);


        const app = express();

        //OPEN DASHBOARD SERVER

        app.set('view engine', 'ejs');
        app.set('views', './app/src/server/views');

        app.use(cors());
        app.use(helmet());

        app.use('/static', express.static('./app/src/server/public'));

        app.get('/', checkData, (req, res) => {
            res.render('index', {
                PREFIX: client.config.PREFIX,
                NAME: client.config.NAME,
                LASTUPDATE: statsData.lastUpdate,
                UPTIME: msToHHMMSS(process.uptime() * 1000),
                MEMORY: statsData.memory,
                CPU: statsData.cpu,
                SERVED: statsData.servedThreads,
                SERVING: statsData.servingThreads
            });
        });

        app.get('/api/uptime', (req, res) => {
            res.json({ uptime: msToHHMMSS(process.uptime() * 1000) });
        })

        app.listen(port, () => {
            client.modules.logger.system(getLang('server.started', { port }));
            resolve();
        });
    });



    function getStats() {
        const procStats = proc();
        const { memTotal, memFree, cpu } = procStats();
        procStats.destroy();
        return {
            memTotal,
            memFree,
            cpu
        };
    }

    function msToHHMMSS(ms) {
        let seconds = Math.floor((ms / 1000) % 60);
        let minutes = Math.floor((ms / (1000 * 60)) % 60);
        let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        if (hours < 10) {
            hours = '0' + hours;
        }
        return `${hours}:${minutes}:${seconds}`;
    }

    async function getThreadAndUserCount() {
        const servedThreads = await db.get('threads') || [];
        const servingThreads = servedThreads.filter(thread => thread.info.isSubscribed == true) || [];
        return {
            servedThreads: servedThreads.length,
            servingThreads: servingThreads.length
        }
    }

    function updateStats() {
        return new Promise(async (resolve, reject) => {
            try {
                const { servedThreads, servingThreads } = await getThreadAndUserCount();
                const { memTotal, memFree, cpu } = getStats();
                statsData = {
                    memory: `${((memTotal.value - memFree.value) / 1073741824).toFixed(2)} / ${(memTotal.value / 1073741824).toFixed(2)} GB`,
                    cpu: cpu.pretty,
                    servedThreads,
                    servingThreads,
                    lastUpdate: Date.now()
                };
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    async function checkData(req, res, next) {
        if (Object.keys(statsData).length === 0 || statsData.lastUpdate < Date.now() - _2HOUR) {
            await updateStats();
        }
        next();
    }
}
