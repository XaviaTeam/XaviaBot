import axios from 'axios';

const NEW_GLOBAL = {
    client: new Object(),
    botID: new String(),
    libs: new Object(),
    get: axios.get, //I don't think this is a good idea, any suggestions?
}

export default NEW_GLOBAL;
