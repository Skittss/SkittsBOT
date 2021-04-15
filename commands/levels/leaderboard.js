const commando = require('discord.js-commando');
const db = require('quick.db');

class viewLb extends commando.Command {
    constructor(client) {
      super(client, {
        name: 'leaderboard',
        aliases: ['lb'],
        group: 'levels',
        memberName: 'leaderboard',
        description: 'View the level leaderboard (top 10 only)',
        examples: []
      });
    }
  
    async run(message, args) {
        
        if(!args) return message.reply("Command usage: `.leaderboard <skittles/xp/battle>`");

        if(!(args == "skittles" || args == "xp" || args == "battle")) return message.reply("Thats not a valid leaderboard!");

        let titleext = ''
        let lbtype = '';
        if(args == "skittles") {
            lbtype = "userBalance_"
            titleext = "(Skittles)"
        } else if(args == "xp") {
            lbtype = "userExp_"
            titleext = "(Levels)"
        } else {
            lbtype = "battleWins_"
            titleext = "(Battle Wins)"
        }

        let amounts = [];
        let respectiveids = [];
        let combined = [];
        db.fetchAll().then(i => {
            for(var entry in i) {
                amounts.push(i[entry].data);
                respectiveids.push(i[entry].ID);
            }

            for(var ind in amounts) {
                if(respectiveids[ind].includes(lbtype) && typeof(amounts[ind]) == "number") {
                    combined.push([amounts[ind],respectiveids[ind].replace(lbtype,'')])
                }
                
            }
            combined = combined.sort(function(a,b){
                return b[0] - a[0];
            })

            //remove duplicates
            var counter = combined.length-1, prev='';
            do {
                if (combined[counter].join('/') === prev) {
                   combined.splice(counter,1);
                }
                prev = combined[counter].join('/');
            } while (counter-- && counter>-1);

            let descr = '';
            var usernames = null;
            let userinds = [];
            for(var users in combined) {
                usernames = message.guild.members.get(combined[users][1]);
                if(`${usernames}`=="undefined" || combined[users][1] == 458044662947774464) {
                    userinds.push(users)
                }
            }
            userinds.reverse();
            for(var userind in userinds) {
                combined.splice(userinds[userind],1)
            }
            for(var users in combined) {
                if(users<10) {
                    usernames = message.guild.members.get(combined[users][1])
                    if(lbtype == "userBalance_") {
                        descr += `${parseInt(users)+1}. ${usernames} - ${combined[users][0]}<:skittles:459276090964180993>\n`
                    } else if(lbtype == "userExp_") {
                        descr += `${parseInt(users)+1}. ${usernames} - ${combined[users][0]}xp, Level: ${Math.floor(Math.sqrt(combined[users][0]/100))}\n` 
                    } else {
                        descr += `${parseInt(users)+1}. ${usernames} - ${combined[users][0]}<:b_medal:461875437358809100>\n` 
                    }
                }
            }
            message.channel.send({embed: {
                color: 3447003,
                description: `**Leaderboard for __${message.guild.name}__ ${titleext}**\n\n**`+descr+`**`
            }});
        })
    }
}

module.exports = viewLb;