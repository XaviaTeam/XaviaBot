import resend from '../../plugins/resend.js';


export default function ({ api, db, controllers }) {
    return async ({ event }) => {
        try {
            await resend({ api, event, db, controllers });
        } catch (e) {
            console.error(e);
        }
    }
}
