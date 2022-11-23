import Users from './users.js';
import Threads from './threads.js';

export default function (api, db) {
    return {
        Users: Users(api, db),
        Threads: Threads(api, db)
    };
}
