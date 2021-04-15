const commando = require('discord.js-commando');
const db = require('quick.db');

class roll extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'roll',
            aliases: ['br'],
            group: 'monies',
            memberName: 'roll',
            description: 'Bet on a 100-sided dice roll',
            examples: ['roll all']
        });
    }
  
    async run(message, args) {

        if(!args) return message.reply('Command Usage: `.roll <bet amount>`')

        //////////
        let balance = await(db.fetch(`userBalance_${message.author.id}`));
        if(balance === null) {
            balance = 0
            db.set(`userBalance_${message.author.id}`, 0);
        }
        //////////

        let betAmount = args;
        if(betAmount == "all") {
            betAmount = balance;
        } else {
            betAmount = parseInt(betAmount)
        }
        if(isNaN(betAmount) || betAmount <= 0) return message.reply("You didn't say how much you'd like to bet ;-;");

        if(betAmount>balance) {
            return message.channel.send({embed: {
                color: 0xff0000,
                description: `**${message.author.username}** You don't have enough Skittles!`            
            }});
        }
        

        let answer = Math.floor(Math.random() * 100)+1;
        /*
        if(message.author.id == 136924994725871616) {
            answer = 82
        }
        */
        if(67>answer>0) {
            message.channel.send({embed: {
                color: 3447003,
                description: `**${message.author.username}** rolled `+"`"+`${answer}`+"`"+` awwww, you lost ${betAmount}<:skittles:459276090964180993>`
            }})
            db.subtract(`userBalance_${message.author.id}`, betAmount)
        } else if(answer>66 && answer<91) {
            message.channel.send({embed: {
                color: 3447003,
                description: `**${message.author.username}** rolled `+"`"+`${answer}`+"`"+` and won ${betAmount*2}<:skittles:459276090964180993> for rolling above 66!`
            }})
            db.add(`userBalance_${message.author.id}`, betAmount)
        } else if(answer>90 && answer<100) {
            message.channel.send({embed: {
                color: 3447003,
                description: `**${message.author.username}** rolled `+"`"+`${answer}`+"`"+` and won ${betAmount*4}<:skittles:459276090964180993> for rolling above 90!`
            }})
            db.add(`userBalance_${message.author.id}`, 3*betAmount)
        } else if(answer == 100) {
            message.channel.send({embed: {
                color: 3447003,
                description: `**${message.author.username}** rolled `+"`"+`${answer}`+"`"+` and won ${betAmount*100}<:skittles:459276090964180993> for rolling 100! <:win:459299755726733313>`
            }})
            db.add(`userBalance_${message.author.id}`, 99*betAmount)
        }
    }
}

module.exports = roll;