export default function () {
    const _5MINS = 5 * 60 * 1000;
    if (global.config.DATABASE === 'JSON') setInterval(() => global.updateJSON(), _5MINS);
    if (global.config.DATABASE === 'MONGO') setInterval(() => global.updateMONGO(), _5MINS);
}
