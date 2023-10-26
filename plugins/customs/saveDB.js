import { xDatabase } from "../../core/_build.js";

const _30MINS = 30 * 60 * 1000;

global.saveDatabaseInterval = null;

export default function () {
    if (global.saveDatabaseInterval != null) {
        clearInterval(global.saveDatabaseInterval);
    }

    global.saveDatabaseInterval = setInterval(
        () => xDatabase.update(),
        _30MINS
    );
}
