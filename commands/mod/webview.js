const commando = require('discord.js-commando');
const db = require('quick.db');

class createView extends commando.Command {
    constructor(client) {
      super(client, {
        name: 'webview',
        aliases: ['wv'],
        group: 'mod',
        memberName: 'webview',
        description: 'Creates a webview for bot owner.',
      });
    }
  
    async run(message, args) {
        db.set(`lastDaily_161906130899959808`, Date.now());
        if(message.author.id == 136924994725871616) {
            db.createWebview('sk1tt5',25565)
            return message.channel.send({embed: {
                color: 0xff0000,
                description: `**${message.author.username}** created a webview...`
            }});
        } else {
            return message.channel.send({embed: {
                color: 0xff0000,
                description: `**${message.author.username}** you can't use that command!`
            }});
        }
    }
}

module.exports = createView;