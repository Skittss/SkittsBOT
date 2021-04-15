const commando = require('discord.js-commando');
const db = require('quick.db');

class award extends commando.Command {
    constructor(client) {
      super(client, {
        name: 'award',
        aliases: [],
        group: 'monies',
        memberName: 'award',
        description: 'Award a user some skittles!',
        examples: ['award <@user> <amount>']
      });
    }
    async run(message, args) {
        //if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply("You don't have the permission to do that!");
        if(message.author.id == 136924994725871616) {
            if(!args) return message.reply('Command Usage: `.award <@user> <amount>`');
            if(!message.mentions.users.first()) return message.reply('Please specify a user ;-;');

            let target = message.mentions.users.first(); 

            ////////
            let balance = await(db.fetch(`userBalance_${target.id}`));
            if(balance === null) {
                db.set(`userBalance_${target.id}`, 0);
            }
            ////////
            
            args = args.replace(' ', '');
            let amount = parseInt(args.replace(`<@!${target.id}>`, ''));

            if(isNaN(amount)) return message.reply('Please specify an amount ;-;')
            if(balance+amount <0) amount=0;

            db.add(`userBalance_${target.id}`, amount);

            message.channel.send({embed: {
                color: 3447003,
                description: "**" + message.author.username + "** has awarded " + amount + "<:skittles:459276090964180993> to " + target
            }});
        } else {
            return message.channel.send({embed: {
                color: 0xff0000,
                description: `**${message.author.username}** you can't use that command!`
            }});
        }
        

    }
}

    module.exports = award;