const commando = require('discord.js-commando'); //commando.js impoort
const path = require('path');

const client = new commando.Client({
    commandPrefix: '.',
    owner: 'OWNER ID HERE (REDACTED FOR REPO UPLOAD)',
    disableEveryone: true,
    unknownCommandResponse: false
});       // create client using import

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['mod', 'Moderator Commands'],
        ['core', 'Main'],
        ['monies', 'Monies'],
        ['levels', 'Levelling Commands'],
        ['battle','Battle Commands']
    ])
    .registerDefaultGroups({

    })
    .registerDefaultCommands({
        
    })
    .registerCommandsIn(path.join(__dirname, "commands"));

client.on('ready', () => {
    console.log('Skitts is online ^^');
    client.user.setActivity('eating skittles');
});

client.login('TOKEN HERE (REDACTED FOR REPO UPLOAD)')

