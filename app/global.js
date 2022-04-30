import axios from 'axios';

const NEW_GLOBAL = {
    client: new Object(),
    botID: new String(),
    libs: new Object(),
    get: axios.get,
}

export default NEW_GLOBAL;
