const commando = require('discord.js-commando');
const db = require('quick.db');
const ms = require('parse-ms');

class getDaily extends commando.Command {
    constructor(client) {
      super(client, {
        name: 'daily',
        aliases: ['d'],
        group: 'monies',
        memberName: 'daily',
        description: 'Redeem daily skittles ^^',
        examples: ['daily (<@user>)']
      });
    }
    async run(message, args) {

        let cooldown = 8.64e+7;
        let amount = 1000;
        let descr = `**${message.author.username}** You collected ${amount}<:skittles:459276090964180993>`

        let target = message.mentions.users.first() || message.author;
        if(target == "<@458044662947774464>") {
            target = message.author;
            descr = `**${message.author.username}** You gave your ${amount}<:skittles:459276090964180993> to <@458044662947774464>, but she gave them back ;)`;
        }

        ////////
        let balance = await(db.fetch(`userBalance_${target.id}`));
        if(balance === null) {
            db.set(`userBalance_${target.id}`, 0);
        }
        ////////

        let lastDaily = await(db.fetch(`lastDaily_${message.author.id}`));

        if(lastDaily !== null && cooldown -(Date.now() - lastDaily) > 0) {
            let timeObj = ms(cooldown - (Date.now() - lastDaily));

            message.channel.send({embed: {
                color: 3447003,
                description: `**${message.author.username}** Collect your skittles again in **${timeObj.hours}h ${timeObj.minutes}m**!`
            }});

        } else {
            if(message.author === target) {

                message.channel.send({embed: {
                    color: 3447003,
                    description: descr
                }});

                db.set(`lastDaily_${message.author.id}`, Date.now());
                db.add(`userBalance_${message.author.id}`, amount);

            } else {

                message.channel.send({embed: {
                    color: 3447003,
                    description: `**${message.author.username}** You collected ${amount}<:skittles:459276090964180993> and gave it to ${target}!`
                }});

                db.set(`lastDaily_${message.author.id}`, Date.now());
                db.add(`userBalance_${target.id}`, amount);

            }

        }
    }
}

    module.exports = getDaily;