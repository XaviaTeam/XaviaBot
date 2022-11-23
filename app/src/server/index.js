import express from 'express';
import cors from 'cors';
import helmet from 'helmet';


const _5MINUTES = 1000 * 60 * 5;

export default function (port = 3000, db) {
    return new Promise((resolve) => {
        setInterval(async () => {
            client.modules.logger.custom(getLang('server.refreshingStats'), 'REFRESH');
            await updateStats();
        }, _5MINUTES);


        const app = express();

        //OPEN DASHBOARD SERVER

        app.set('view engine', 'ejs');
        app.set('views', './app/src/server/views');

        app.use(cors());
        app.use(helmet());

        app.use('/static', express.static('./app/src/server/public'));

        app.get('/', checkData, (req, res) => {
            const { uptime } = client.modules.getStats(); 
            res.render('index', {
                PREFIX: client.config.PREFIX,
                NAME: client.config.NAME,
                LASTUPDATE: statsData.lastUpdate,
                UPTIME: uptime,
                MEMORY: statsData.memory,
                CPU: statsData.cpu,
                SERVED: statsData.servedThreads,
                SERVING: statsData.servingThreads
            });
        });

        app.get('/api/uptime', (req, res) => {
            const { uptime } = client.modules.getStats(); 
            res.json({ uptime: uptime });
        })

        app.listen(port, () => {
            client.modules.logger.system(getLang('server.started', { port }));
            resolve();
        });
    });


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
                const { cpu, processMemUsed } = client.modules.getStats();
                statsData = {
                    memory: processMemUsed,
                    cpu: cpu,
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
        if (Object.keys(statsData).length === 0 || statsData.lastUpdate < Date.now() - _5MINUTES) {
            await updateStats();
        }
        next();
    }
}
