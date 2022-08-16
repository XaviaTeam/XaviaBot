export const sendNotification = {
    aliases: ['notify', 'sendnoti', 'sendnotification', 'echoall'],
    about: 'Sends a notification to all threads\' monitors.',
    execute: ({ api, input }) => {
        loop(Object.keys(client.data.monitorServerPerThread).length, i => {
            const threadID = Object.values(client.data.monitorServerPerThread)[i];
            setTimeout(() => api.sendMessage(`====[ NOTIFY ]====\n\n${input}`, threadID), i * 500);
        })
    }
}


export const logout = {
    aliases: ['logout', 'killstate'],
    about: 'Logout of the bot system.',
    execute: ({ api }) => {
        api.logout(err => {
            if (err) {
                console.error(err);
                client.modules.logger.error('Error while logging out.');
            } else {
                client.modules.logger.system('Logged out.');
            }
        })
    }
}
