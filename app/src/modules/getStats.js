import os from 'os';
const cpus = os.cpus();
const _1KB = 1024, _1MB = _1KB * 1024, _1GB = _1MB * 1024;
const _1S = 1000, _1M = 60 * _1S, _1H = 60 * _1M;

const pretty = bytes => {
    let text;
    if (bytes >= _1GB) {
        text = (bytes / _1GB).toFixed(2) + " GB";
    } else if (bytes >= _1MB) {
        text = (bytes / _1MB).toFixed(2) + " MB";
    } else {
        text = (bytes / _1KB).toFixed(2) + " KB";
    }

    return text;
}


const getStats = () => {
    const up = process.uptime() * 1000;

    const hours = ("0" + Math.floor(up / _1H)).slice(-2);
    const minutes = ("0" + Math.floor((up - (hours * _1H)) / _1M)).slice(-2);
    const seconds = ("0" + Math.floor((up - (hours * _1H) - (minutes * _1M)) / _1S)).slice(-2);

    const totalMem_bytes = os.totalmem();
    const freeMem_bytes = os.freemem();

    const memTotal = pretty(totalMem_bytes);
    const memFree = pretty(freeMem_bytes);
    const processMemUsed = pretty(process.memoryUsage().rss);
    const totalMemUsed = pretty(totalMem_bytes - freeMem_bytes);
    
    return {
        cpu: cpus[0].model,
        memTotal,
        memFree,
        totalMemUsed,
        processMemUsed,
        uptime: `${hours}:${minutes}:${seconds}`
    }
}


export default getStats;
