const commando = require('discord.js-commando');
const db = require('quick.db');

//inventory format: [[<item1id>,<amount>],[<item2id>,<amount>]]
//weapon choices: Daggers, Sword, Dualies, Shruikens, Spear
//weapon attributes: Bleed, (Base stats), Crits, Attack priority, Armor piercing.
//weapons levels: Sword-0,Daggers-1,Dualies-2,Shurikens-3,Spear-4

//spells: Healing (health up), Swiftness (priority up), Defense (Armor up), Weakness (Armor down), Offense (damage up)

class inventoryView extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'b-stats',
            aliases: [],
            group: 'battle',
            memberName: 'b-stats',
            description: "View a user's battle stats",
            examples: ['b-stats (<@user>)']
        }); 
    }
  
    async run(message, args) {
    
        let target = message.mentions.users.first() || message.author;

        if(!target || target.bot) return message.reply("Please specify a valid user!")

        let battlexp = await(db.fetch(`battleExp_${target.id}`));
        if(battlexp === null) {
            battlexp = 0
            db.set(`battleExp_${target.id}`, 0);
        }

        //battlelevel = 50*level^2
        let battlelevel = Math.floor(Math.sqrt(battlexp/50));
        let thislvlxp = 50*(Math.pow(battlelevel, 2));
        let nextlvlxp = 50*(Math.pow(battlelevel+1, 2));
        let xpprogress = nextlvlxp - battlexp;
        let lvlpercent = Math.floor(((battlexp-thislvlxp)/(nextlvlxp-thislvlxp)*10));

        let levelbar = `**${lvlpercent*10}%**\n${'<:empty:459351098516439052>'.repeat(lvlpercent)}${'<:full:459351098877149185>'.repeat(10-lvlpercent)}\n**${xpprogress}xp** required to level up`

        let battlewins = await(db.fetch(`battleWins_${target.id}`));
        if(battlewins === null) {
            battlewins = 0
            db.set(`battleWins_${target.id}`, 0);
        }

        /*
        let invarr = await(db.fetch(`userInventory_${target.id}`));
        if(invarr === null) {
            invarr = []
            db.set(`userInventory_${target.id}`, []);
        }
        */

        let daggersFlag = ['<:b_lock:461875437656866826>', '`(level 1)`'];
        let dualiesFlag = ['<:b_lock:461875437656866826>', '`(level 2)`'];
        let shurikensFlag = ['<:b_lock:461875437656866826>', '`(level 3)`'];
        let spearFlag = ['<:b_lock:461875437656866826>', '`(level 4)`'];
        if(battlelevel > 0) {
            daggersFlag =['<:b_unlock:461875437606535178>', ''];
        }
        if(battlelevel > 1) {
            dualiesFlag = ['<:b_unlock:461875437606535178>', ''];
        }
        if(battlelevel > 2) {
            shurikensFlag = ['<:b_unlock:461875437606535178>', ''];
        }
        if(battlelevel > 3) {
            spearFlag = ['<:b_unlock:461875437606535178>', ''];
        }
        //console.log(invarr);
        message.channel.send({embed: {
            color: 3447003,
            description: `__**${target.username}'s Battle Stats**__\n\n**${battlewins}**<:b_medal:461875437358809100>\n\n**Battle Experience -** ${battlexp}xp - Level: ${battlelevel}\n\n${levelbar}\n\n__**Unlocks:**__\n\n__Weapons__:\n<:b_unlock:461875437606535178>Sword \n${daggersFlag[0]}Daggers ${daggersFlag[1]}\n${dualiesFlag[0]}Dualies ${dualiesFlag[1]}\n${shurikensFlag[0]}Shurikens ${shurikensFlag[1]}\n${spearFlag[0]}Spear ${spearFlag[1]}\n\n__Spells__:\n<:b_unlock:461875437606535178>Healing\n${daggersFlag[0]}Swiftness ${daggersFlag[1]}\n${dualiesFlag[0]}Defense ${dualiesFlag[1]}\n${shurikensFlag[0]}Weakness ${shurikensFlag[1]}\n${spearFlag[0]}Offense ${spearFlag[1]}`
        }});
    }
}

module.exports = inventoryView;