const commando = require('discord.js-commando');
const db = require('quick.db');

class spinWheel extends commando.Command {
    constructor(client) {
      super(client, {
        name: 'spin',
        aliases: ['bs'],
        group: 'monies',
        memberName: 'spin',
        description: 'Bet on a wheel spin!',
        examples: ['spin <bet amount>']
      });
    }
  
    async run(message, args) {

        if(!args) return message.reply('Command Usage: `.spin <bet amount>`');
        
        let betAmount = args;
        if(betAmount == "all") {
            betAmount = balance;
        } else {
            betAmount = parseInt(betAmount)
        }
        if(isNaN(betAmount) || betAmount <= 0) return message.reply("You didn't say how much you'd like to bet ;-;");

        //////////
        let balance = await(db.fetch(`userBalance_${message.author.id}`));
        if(balance === null) {
            balance = 0
            db.set(`userBalance_${message.author.id}`, 0);
        }
        //////////

        if(betAmount>balance) {
            return message.channel.send({embed: {
                color: 0xff0000,
                description: `**${message.author.username}** You don't have enough Skittles!`            
            }});
        }

        let choices = [0.1,0.2,0.3,0.5,1.2,1.5,1.7,2.4];
        let emotelist = [":arrow_lower_left:",":arrow_lower_right:",":arrow_down:",":arrow_right:",":arrow_left:",":arrow_upper_left:",":arrow_upper_right:",":arrow_up:"];
        let chosen = Math.floor(Math.random() * choices.length);
        let answer = choices[chosen];
        let emotechoice = emotelist[chosen];

        db.subtract(`userBalance_${message.author.id}`, betAmount)
        db.add(`userBalance_${message.author.id}`, Math.floor(betAmount*answer));

        message.channel.send({embed: {
            color: 3447003,
            description: `**${message.author.username}** bet **${betAmount}**<:skittles:459276090964180993> and got **${Math.floor(betAmount*answer)}**<:skittles:459276090964180993> in return!\n\n**『+50%』     『+140%』     『+70%』\n\n\n『+20%』             ${emotechoice}              『-50%』\n\n\n『-90%』       『-70%』       『-80%』**`
        }});

        
    }
}

module.exports = spinWheel;