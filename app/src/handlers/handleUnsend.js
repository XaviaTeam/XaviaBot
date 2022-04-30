import resend from '../../plugins/resend.js';


export default function ({ api, db, controllers }) {
    return ({ event }) => resend({ api, event, db, controllers });
}
