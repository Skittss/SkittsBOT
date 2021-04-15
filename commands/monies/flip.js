const commando = require('discord.js-commando');
const db = require('quick.db');

class coinFlip extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'flip',
            aliases: ['bf'],
            group: 'monies',
            memberName: 'flip',
            description: 'Bet on a coin flip',
            examples: ['flip all heads']
        });
    }
  
    async run(message, args) {

        if(!args) return message.reply('Command Usage: `.flip <bet amount> <heads/tails>`')

        //////////
        let balance = await(db.fetch(`userBalance_${message.author.id}`));
        if(balance === null) {
            balance = 0
            db.set(`userBalance_${message.author.id}`, 0);
        }
        //////////
        
        let choices = ["h","t"];
        args = args.split(" ");

        let betAmount = args[0];
        if(betAmount == "all") {
            betAmount = balance;
        } else {
            betAmount = parseInt(betAmount)
        }
        let betChoice = args[1];
        let randomFlag = ''
        if(isNaN(betAmount) || betAmount <= 0) return message.reply("You didn't say how much you'd like to bet ;-;");
        if(!betChoice) {
            betChoice = choices[Math.floor(Math.random() * choices.length)];
            randomFlag = "(chosen randomly for you)"
        }
        betChoice = betChoice.toLowerCase();
        if(!(betChoice == "h" || betChoice == "t" || betChoice == "heads" || betChoice == "tails")) return message.reply("That's not a valid bet!");
        if(betChoice.length>1) betChoice = betChoice.charAt(0);

        if(betAmount>balance) {
            return message.channel.send({embed: {
                color: 0xff0000,
                description: `**${message.author.username}** You don't have enough Skittles!`            
            }});
        }
        
        let answer = choices[Math.floor(Math.random() * choices.length)];
        if(betChoice == answer) {
            if(betChoice == "h") {
                betChoice = "Heads"
                answer = "Heads"
            } else {
                betChoice = "Tails"
                answer = "Tails"
            }
            message.channel.send({embed: {
                color: 3447003,
                description: `__**You guessed:**__   ${betChoice} ${randomFlag}\n__**Coin Landed:**__    ${answer}\n\n**${message.author.username}** guessed correctly and won ${2*betAmount}<:skittles:459276090964180993>!`
            }})
            db.add(`userBalance_${message.author.id}`, betAmount)
        } else {
            if(betChoice == "h") {
                betChoice = "Heads"
                answer = "Tails"
            } else {
                betChoice = "Tails"
                answer = "Heads"
            }
            message.channel.send({embed: {
                color: 3447003,
                description: `__**You guessed:**__   ${betChoice} ${randomFlag}\n__**Coin Landed:**__    ${answer}\n\n**${message.author.username}** guessed incorrectly and lost ${betAmount}<:skittles:459276090964180993>!`
            }})
            db.subtract(`userBalance_${message.author.id}`, betAmount)
        }
    }
}

module.exports = coinFlip;