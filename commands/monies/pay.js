const commando = require('discord.js-commando');
const db = require('quick.db');

class payUser extends commando.Command {
    constructor(client) {
      super(client, {
        name: 'pay',
        aliases: [],
        group: 'monies',
        memberName: 'pay',
        description: 'Give a user some skittles!',
        examples: ['pay <@user> <amount>']
      });
    }
    
    async run(message, args) {

        if(!args) return message.reply('Command Usage: `.pay <@user> <amount>`');
      
        let target = message.mentions.users.first();
        if(!target) return message.reply("You didn't specify a user! ;-;");
        if(target === message.author) return message.reply("You can't pay yourself!")
        if(target == "<@458044662947774464>") return message.channel.send("*Skitts declines your humble offering*");

        args = args.replace(' ', '');
        let amount = parseInt(args.replace(`<@!${target.id}>`, ''));
        
        if(isNaN(amount) || amount <= 0) return message.reply("You didn't give me an amount! :(");


        let selfbalance = await(db.fetch(`userBalance_${message.author.id}`));
        if(selfbalance === null) {
            selfbalance = 0
            db.set(`userBalance_${message.author.id}`, 0);
        }
        let targetbalance = await(db.fetch(`userBalance_${target.id}`));
        if(targetbalance === null) {
            targetbalance = 0
            db.set(`userBalance_${target.id}`, 0);
        }

        if(amount>selfbalance) {
            return message.channel.send({embed: {
                color: 0xff0000,
                description: `**${message.author.username}** You don't have enough Skittles!`            
            }});
        }
        db.add(`userBalance_${target.id}`, amount);
        db.subtract(`userBalance_${message.author.id}`, amount);
  
        message.channel.send({embed: {
            color: 3447003,
            description: `**${message.author.username}** has given ${amount}<:skittles:459276090964180993> to **${target.username}**\n__**Balance:**__\n${message.author}: ${selfbalance-amount}<:skittles:459276090964180993>         ${target}: ${targetbalance+amount}<:skittles:459276090964180993>`
        }});
    }
  }
  
  module.exports = payUser;