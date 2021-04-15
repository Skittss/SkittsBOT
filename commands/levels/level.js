const commando = require('discord.js-commando');
const db = require('quick.db');

class eatSkitts extends commando.Command {
    constructor(client) {
      super(client, {
        name: 'level',
        aliases: ['lvl'],
        group: 'levels',
        memberName: 'level',
        description: "Displays a user's level",
        examples: ['level <@user>']
      });
    }
  
    async run(message, args) {

        let target = message.mentions.users.first() || message.author;

        ////////
        let userxp = await(db.fetch(`userExp_${target.id}`));
        if(userxp === null) {
            userxp = 0
            db.set(`userExp_${target.id}`, 0);
        }
        ////////

        // 100*level^2 = experience
        // Math.floor(Math.sqrt(experience/100))

        let level = Math.floor(Math.sqrt(userxp/100));
        let thislvlxp = 100*(Math.pow(level, 2));
        let nextlvlxp = 100*(Math.pow(level+1, 2));
        let xpprogress = nextlvlxp - userxp;
        let lvlpercent = Math.floor(((userxp-thislvlxp)/(nextlvlxp-thislvlxp)*10));

        message.channel.send({embed: {
            color: 3447003,
            description: `__**${target.username}**__\n\n**Level ${level} - ${userxp}xp**\n\n**Level Progress: ~${lvlpercent*10}%**\n${'<:empty:459351098516439052>'.repeat(lvlpercent)}${'<:full:459351098877149185>'.repeat(10-lvlpercent)}\n\n**${xpprogress}xp** required to level up`
        }});
    }
}

module.exports = eatSkitts;