const commando = require('discord.js-commando');
const db = require('quick.db');

class eatSkitts extends commando.Command {
    constructor(client) {
      super(client, {
        name: 'eat',
        aliases: ['nom'],
        group: 'levels',
        memberName: 'eat',
        description: 'Eat skittles to gain exp!',
        examples: ['eat <amount>']
      });
    }
  
    async run(message, args) {

        if(!args) return message.reply("Command usage: `.eat <amount>`");

        let amount = args;
        if(isNaN(amount)) return message.reply('Please give a valid amount! ;-;');
        amount = parseInt(args);

        ////////
        let balance = await(db.fetch(`userBalance_${message.author.id}`));
        if(balance === null) {
            balance = 0
            db.set(`userBalance_${message.author.id}`, 0);
        }
        ////////

        if(amount>balance || amount <= 0) {
            return message.channel.send({embed: {
                color: 0xff0000,
                description: `**${message.author.username}** You can't eat that many skittles!`            
            }});
        }

        ////////
        let exppoints = await(db.fetch(`userExp_${message.author.id}`));
        if(exppoints === null) {
            exppoints = 0
            db.set(`userExp_${message.author.id}`, 0);
        }
        ////////

        let expgain = amount*1;

        db.add(`userExp_${message.author.id}`, expgain);
        db.subtract(`userBalance_${message.author.id}`, amount);
        message.channel.send({embed: {
            color: 3447003,
            description: `**${message.author.username}** ate ${amount}<:skittles:459276090964180993> and gained `+"`"+`${expgain}`+"xp!`"+`\n\n${message.author} now has `+"`"+`${exppoints+expgain}`+"xp!`"
        }});
    }
}

module.exports = eatSkitts;