const _30MINS = 30 * 60 * 1000;

global.saveDatabaseInterval = null;

/** @type {TOnCallCustom} */
export default function onCall({ xDB }) {
    if (global.saveDatabaseInterval != null) {
        clearInterval(global.saveDatabaseInterval);
    }

    global.saveDatabaseInterval = setInterval(
        () => xDB.update(),
        _30MINS
    );
}
