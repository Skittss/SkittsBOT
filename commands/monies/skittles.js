const commando = require('discord.js-commando');
const db = require('quick.db');

class checkBalance extends commando.Command {
    constructor(client) {
      super(client, {
        name: 'skittles',
        aliases: ['$','skitts'],
        group: 'monies',
        memberName: 'skittles',
        description: 'Check the balance of a user',
        examples: ['skittles (<@user>)']
      });
    }
  
    async run(message, args) {
    
      let target = message.mentions.users.first() || message.author;

      let balance = await(db.fetch(`userBalance_${target.id}`));
      if(balance === null) {
        balance = 0
        db.set(`userBalance_${target.id}`, 0);
      }

      message.channel.send({embed: {
        color: 3447003,
        description: "**"+target.username+"**" + " has " + balance + "<:skittles:459276090964180993>"
      }});
    }
}

module.exports = checkBalance;