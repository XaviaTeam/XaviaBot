export const reboot = {
    aliases: ['reboot', 'restart'],
    about: 'Reboots the bot system.',
    execute: ({}) => {
        process.exit(1);
    }
}

export const exit = {
    aliases: ['exit', 'quit', 'close', 'kill'],
    about: 'Exits the bot system.',
    execute: ({}) => {
        process.exit(0);
    }
}
