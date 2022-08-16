export const helper = {
    aliases: ['help', 'commands', 'cmds', 'cmd'],
    about: 'Shows the list of commands.',
    execute: (commands) => {
        let output = '\n';
        for (const key in commands) {
            output += `${commands[key].aliases[0]} - ${commands[key].about}\n`;
        }

        console.log(output);
    }
}
