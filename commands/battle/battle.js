const commando = require('discord.js-commando');
const db = require('quick.db');
var accepted = 'no'

//inventory format: [[<item1id>,<amount>],[<item2id>,<amount>]]
//weapon choices: Daggers, Sword, Dualies, Shruikens, Spear
//weapon attributes: Bleed, (Base stats), Crits, Attack priority, Armor piercing.
//weapons levels: Sword-0,Daggers-1,Dualies-2,Shurikens-3,Spear-4

//spells: Healing (health up), Swiftness (priority up), Defense (Armor up), Weakness (Armor down), Offense (damage up)

var sword = {
    basedmg: 55,
    attackspd: 4,
    weaponfx: ''
};

var daggers = {
    basedmg: 30,
    attackspd: 6,
    weaponfx: 'bleed' //[bleed, lasts n turns, n damage per turn]
};

var dualies = {
    basedmg: 45,
    attackspd: 6,
    weaponfx: 'crit' //[crit, crit chance, damage multiplier]
};

var shurikens = {
    basedmg: 35,
    attackspd: 8,
    weaponfx: ''
};

var spear = {
    basedmg: 50,
    attackspd: 5,
    weaponfx: '' //[pierce, ignore %]
};

class battleUser extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'battle',
            aliases: [],
            group: 'battle',
            memberName: 'battle',
            description: "Fight a user!",
            examples: ['battle <@user>']
        }); 
    }
  
    async run(message, args) {

        if(!args) return message.reply("Command usage: `.battle <@user>`");
        
        let target = message.mentions.users.first();
        if(!target) return message.reply("Please specify a user!");
        if(target.id == 458044662947774464) return message.reply("Sh-should i be scared?!");
        if(target == message.author || target.bot) return message.reply("Please specify a valid user!")

        message.channel.send(`**${message.author.username}** challeges **${target.username}** to a battle! ${target} do you accept? (yes/no)`)
        await message.channel.awaitMessages(response => {
            if(response.content === "yes" && response.author.id == target.id) {
                accepted = 'yes'
                return message.channel.send("battle commencing...");
            } else if(response.content === "no" && response.author.id == target.id) {
                accepted = 'no'
                return message.channel.send(`${target} declined!`)
            }
        }, {max: 1, time: 30000, errors: ['time'] })
        .catch(() => {
            message.channel.send(`${target} did not respond in time (30s)!`);
            accepted = 'no'
        })

        if(accepted === "yes") {
            let userbattlexp = await(db.fetch(`battleExp_${message.author.id}`));
                if(userbattlexp === null) {
                userbattlexp = 0
                db.set(`battleExp_${message.author.id}`, 0);
            }

            let oppbattlexp = await(db.fetch(`battleExp_${target.id}`));
                if(oppbattlexp === null) {
                oppbattlexp = 0
                db.set(`battleExp_${target.id}`, 0);
            }

            let usrbattlewins = await(db.fetch(`battleWins_${message.author.id}`));
            if(usrbattlewins === null) {
                usrbattlewins = 0
                db.set(`battleWins_${message.author.id}`, 0);
            }

            let oppbattlewins = await(db.fetch(`battleWins_${target.id}`));
            if(oppbattlewins === null) {
                oppbattlewins = 0
                db.set(`battleWins_${target.id}`, 0);
            }

            //battlelevel = 50*level^2
            let userbattlelevel = Math.floor(Math.sqrt(userbattlexp/50)); 
            let userweaponlevel = userbattlelevel;
            if(userweaponlevel > 5) userweaponlevel = 5;

            let oppbattlelevel = Math.floor(Math.sqrt(oppbattlexp/50));
            let oppweaponlevel = oppbattlelevel;
            if(oppweaponlevel > 5) oppweaponlevel = 5;
            //bet phase

            
            let weaponsavailable = ['sword','daggers','dualies','shurikens','spear'];
            let spellsavailable = ["healing", "swiftness", "defense", "weakness", "offense"];
            let userweapons = weaponsavailable.slice(0,userweaponlevel+1)
            let oppweapons = weaponsavailable.slice(0,oppweaponlevel+1)
            let userspells = spellsavailable.slice(0,userweaponlevel+1)
            let oppspells = spellsavailable.slice(0,oppweaponlevel+1)
            let usrwep = ''
            let usrspell = ''
            let oppwep = ''
            let oppspell = ''

            let healthgain = 0;
            let loser = '';
            let userHealth = 400;
            let usrturndmg = 0
            let usreffect = '';
            let usrdmgmod = 1;
            let usrbleedtimer = 0;
            let userhasarmor = false;
            let userswiftup = 0;
            //let userisweakened = false;
            //let userdamageup = false;
            let oppHealth = 400;
            let oppturndmg = 400;
            let oppeffect = '';
            let oppdmgmod = 1;
            let oppbleedtimer = 0;
            let opphasarmor = false;
            let oppswiftup = 0;
            //let oppisweakened = false;
            //let oppdamageup = false;
            let turn = 1;
            let attackevents = '';
            let spellevents = '';
            let effectevents = '';
            let formatusrspells = Object.assign(...userspells.map(d => ({[d]: 1})));
            let formatoppspells = Object.assign(...oppspells.map(d => ({[d]: 1})));
            let textusrspells = ''
            let textoppspells = ''
            var key;

            while(userHealth > 0 && oppHealth > 0 && loser == '') {
                textusrspells = '';
                textoppspells = '';
                //prep phase(turn)
                //
                //
                for(key in formatusrspells) {
                    if(formatusrspells[key] > 0) {
                        textusrspells += `${formatusrspells[key]}x: ${key}\n`
                    } else {
                        textusrspells += `~~${formatusrspells[key]}x: ${key}~~\n`
                    }
                }
                for(key in formatoppspells) {
                    if(formatoppspells[key] > 0) {
                        textoppspells += `${formatoppspells[key]}x: ${key}\n`  
                    } else {
                        textoppspells += `~~${formatoppspells[key]}x: ${key}~~\n`
                    }
                }
                message.channel.send({embed: {
                    color: 3447003,
                    description: `__**`+"`"+`Turn ${turn}`+"`"+` preparation (${message.author})**__\n\n**HP:** ${userHealth}/400\n\n**Available Weapons:**\n\n${userweapons.join("\n")}\n\n**Available Spells:**\n\n${textusrspells}\n**Please type your choices as follows: `+"`"+`<weapon> (<spell>)`+"`**"
                }});

                await message.channel.awaitMessages(response => {
                    let msgargs = response.content.split(" ");

                    if(response.author.id == message.author.id && userweapons.includes(msgargs[0].toLowerCase())) {
                        if(msgargs[1]) {
                            if(userspells.includes(msgargs[1].toLowerCase())) {
                                response.delete();
                                usrwep = msgargs[0].toLowerCase()
                                usrspell = msgargs[1].toLowerCase()
                                return message.channel.send(`${message.author.username} has finished preparing!`);
                                
                            }
                        } else {
                            response.delete();
                            usrwep = msgargs[0].toLowerCase()
                            usrspell = ''
                            return message.channel.send(`${message.author.username} has finished preparing!`);
                        }
                        
                    }
                }, {max: 1, time: 60000, errors: ['time'] })
                .catch(() => {
                    message.channel.send(`**${message.author}** did not respond in time (60s) and forfeited the match!`);
                    return loser = message.author;
                })
                //
                //-----------------------------
                //
                if(loser == '') {

                    message.channel.send({embed: {
                        color: 3447003,
                        description: `__**`+"`"+`Turn ${turn}`+"`"+` preparation (${target})**__\n\n**HP:** ${oppHealth}/400\n\n**Available Weapons:**\n\n${oppweapons.join("\n")}\n\n**Available Spells:**\n\n${textoppspells}\n**Please type your choices as follows: `+"`"+`<weapon> (<spell>)`+"`**"
                    }});

                    await message.channel.awaitMessages(response => {
                        let msgargs = response.content.split(" ");

                        if(response.author.id == target.id && oppweapons.includes(msgargs[0].toLowerCase())) {
                            if(msgargs[1]) {
                                if(oppspells.includes(msgargs[1].toLowerCase())) {
                                    response.delete();
                                    oppwep = msgargs[0].toLowerCase()
                                    oppspell = msgargs[1].toLowerCase()
                                    return message.channel.send(`${target.username} has finised preparing!`);
                                    
                                }
                            } else {
                                response.delete();
                                oppwep = msgargs[0].toLowerCase()
                                oppspell = ''
                                return message.channel.send(`${target.username} has finished preparing!`);
                            }
                            
                        }
                    }, {max: 1, time: 60000, errors: ['time'] })
                    .catch(() => {
                        message.channel.send(`**${target}** did not respond in time (60s) and forfeited the match!`);
                        return loser = target;
                    })
                    if(loser == '') {
                        //fight sequence:
                        //
                        //reset spell bonuses for the turn:
                        usrdmgmod = 1;
                        userhasarmor = false;
                        userswiftup = 0;
                        //userdamageup = false;
                        oppdmgmod = 1;
                        opphasarmor = false;
                        oppswiftup = 0;
                        //oppdamageup = false;
                        //userisweakened = false;
                        //oppisweakened = false;
                        attackevents = '';
                        spellevents = '';
                        effectevents = '';

                        

                        if(formatusrspells[usrspell] == 0) {
                            spellevents += `>>> **${message.author.username}** failed to use a ${usrspell} spell as they ran out!\n`
                        } else if(usrspell == 'healing') {
                            healthgain = 40+(Math.floor(Math.random() * 21));
                            userHealth += healthgain;
                            if(userHealth > 400) {
                                userHealth = 400;
                                healthgain = 'back up to max';
                            }
                            spellevents += `>>> **${message.author.username}** used a healing spell and replenished **${healthgain} hp!**\n`
                        } else if(usrspell == 'swiftness') {
                            userswiftup = 2;
                            spellevents += `>>> **${message.author.username}** used a swiftness spell and gained **+2 attack priority** for the turn!\n`
                        } else if(usrspell == 'defense' && !(oppspell == 'weakness')) {
                            userhasarmor = true;
                            spellevents += `>>> **${message.author.username}** used a defense spell and reduced damage taken for the turn!\n`
                        } else if(usrspell == 'defense' && oppspell == 'weakness') {
                            spellevents += `>>> **${message.author.username}'s** defense spell was countered by **${target.username}'s** weakness spell!\n`
                        } else if(usrspell == 'weakness' && !(oppspell == 'defense')) {
                            //oppisweakened = true;
                            spellevents += `>>> **${message.author.username}'s** weakness spell had no effect!\n`
                        } else if(usrspell == 'offense') {
                            oppdmgmod += 0.2;
                            spellevents += `>>> **${message.author.username}'s** increased their damage output by **20%** for the turn!\n`
                        }

                        if(formatoppspells[oppspell] == 0) {
                            spellevents += `>>> **${target.username}** failed to use a ${oppspell} spell as they ran out!\n`
                        } else if(oppspell == 'healing') {
                            healthgain = 40+(Math.floor(Math.random() * 21));
                            oppHealth += healthgain;
                            if(oppHealth > 400) {
                                oppHealth = 400;
                                healthgain = 'back up to max';
                            }
                            spellevents += `>>> **${target.username}** used a healing spell and replenished **${healthgain} hp!**\n`
                        } else if(oppspell == 'swiftness') {
                            oppswiftup = 2;
                            spellevents += `>>> **${target.username}** used a swiftness spell and gained **+2 attack priority** for the turn!\n`
                        } else if(oppspell == 'defense' && !(usrspell == 'weakness')) {
                            opphasarmor = true;
                            spellevents += `>>> **${target.username}** used a defense spell and reduced damage taken for the turn!\n`
                        } else if(oppspell == 'defense' && usrspell == 'weakness') {
                            spellevents += `>>> **${target.username}'s** defense spell was countered by **${message.author.username}'s** weakness spell!\n`
                        } else if(oppspell == 'weakness' && !(usrspell == 'defense')) {
                            //userisweakened = true;
                            spellevents += `>>> **${target.username}'s** weakness spell had no effect!\n`
                        } else if(oppspell == 'offense') {
                            usrdmgmod += 0.2;
                            spellevents += `>>> **${target.username}'s** increased their damage output by **20%** for the turn!\n`
                        }
                        
                        if(formatusrspells[usrspell] > 0) formatusrspells[usrspell] -= 1;
                        if(formatoppspells[oppspell] > 0) formatoppspells[oppspell] -= 1;
                        usreffect = eval(oppwep).weaponfx;
                        oppeffect = eval(usrwep).weaponfx;

                        if(usreffect == 'crit' && (Math.floor(Math.random() * 100)+1) > 70) {
                            usrdmgmod += 1;
                            effectevents += `>>> **${target.username}** got a critical hit and did **2x** damage to **${message.author.username}**!\n`
                        } else if(usreffect == 'bleed') {
                            usrbleedtimer = 3;
                            effectevents += `>>> **${target.username}** caused **${message.author.username}** to bleed for 3 turns!\n`
                        }
                        
                        if(oppeffect == 'crit' && (Math.floor(Math.random() * 100)+1) > 70) {
                            oppdmgmod += 1;
                            effectevents += `>>> **${message.author.username}** got a critical hit and did **2x** damage to **${target.username}**!\n`
                        } else if(oppeffect == 'bleed') {
                            oppbleedtimer = 3;
                            effectevents += `>>> **${message.author.username}** caused **${target.username}** to bleed for 3 turns!\n`
                        }
                        
                        if(userhasarmor && !(oppwep == 'spear')) {
                            usrturndmg = Math.floor(usrdmgmod*(0.6*(eval(oppwep).basedmg)-10+Math.floor(Math.random() * 21)));
                        } else {
                            usrturndmg = usrdmgmod*((eval(oppwep).basedmg)-10+Math.floor(Math.random() * 21));
                            if(userhasarmor) {
                                effectevents += `>>> **${target.username}** pierced **${message.author.username}'s** armor with their spear!\n`
                            }
                        }
                        
                        userHealth -= usrturndmg;

                        if(opphasarmor && !(usrwep == 'spear')) {
                            oppturndmg = Math.floor(oppdmgmod*(0.6*(eval(usrwep).basedmg)-10+Math.floor(Math.random() * 21)));
                        } else {
                            oppturndmg = oppdmgmod*((eval(usrwep).basedmg)-10+Math.floor(Math.random() * 21));
                            if(opphasarmor) {
                                effectevents += `>>> **${message.author.username}** pierced **${target.username}'s** armor with their spear!\n`
                            }
                        }

                        oppHealth -= oppturndmg;

                        attackevents += `>>> **${message.author.username}** attacked **${target.username}** with ${usrwep} dealing **${oppturndmg} damage!**\n`
                        attackevents += `>>> **${target.username}** attacked **${message.author.username}** with ${oppwep} dealing **${usrturndmg} damage!**\n`

                        if(usrbleedtimer > 0) {
                            userHealth -= 10
                            effectevents += `>>> **${message.author.username}** took 10 damage from bleeding!\n`
                        }
                        if(oppbleedtimer > 0) {
                            oppHealth -= 10
                            effectevents += `>>> **${target.username}** took 10 damage from bleeding!\n`
                        }

                        if(userHealth < 0) userHealth = 0;
                        if(oppHealth < 0) oppHealth = 0;

                        message.channel.send({embed: {
                            color: 0xff0000,
                            description: `${spellevents}\n${attackevents}\n${effectevents}\n**${message.author.username}'s HP: **`+"`"+`${userHealth}/400`+"`"+`\n\n**${target.username}'s HP: **`+"`"+`${oppHealth}/400`+"`"
                        }});
                        
                    }
                }
                if(usrbleedtimer > 0) usrbleedtimer -= 1;
                if(oppbleedtimer > 0) oppbleedtimer -= 1;
                turn += 1;
            }
            
            var winner = ''
            if(loser == '') {
                var endmessage = ''
                //message.channel.send("neck me");
                if(userHealth > 0 && oppHealth == 0) {
                    loser = target
                    winner = message.author
                    endmessage += `>>> **${target.username}** was finished off by **${message.author.username}** with their ${usrwep}\n\n**${message.author.username} wins!**`
                } else if(oppHealth > 0 && userHealth == 0) {
                    loser = message.author
                    winner = target
                    endmessage += `>>> **${message.author.username}** was finished off by **${target.username}** with their ${oppwep}!\n\n**${target.username} wins!**`
                } else {
                    if((eval(usrwep).attackspd)+userswiftup > (eval(oppwep).attackspd)+oppswiftup) {
                        loser = target
                        winner = message.author
                        endmessage += `>>> **${message.author.username}** defeated **${target.username}** right before they could land their final attack!\n\n**${message.author.username} wins!**`
                    } else if((eval(usrwep).attackspd)+userswiftup < (eval(oppwep).attackspd)+oppswiftup) {
                        endmessage += `>>> **${target.username}** defeated **${message.author.username}** right before they could land their final attack!\n\n**${target.username} wins!**`
                        loser = message.author
                        winner = target
                    } else {
                        loser = 'draw'
                        winner = 'draw'
                        endmessage += `>>> **${target.username}** and **${message.author.username}** annihilated eachother at the same time!\n\n**Draw!**`
                    }
                }

                message.channel.send({embed: {
                    color: 0xff0000,
                    description: `${endmessage}\n`
                }});
            }

            if(winner == '') {
                if(loser == target) {
                    db.add(`battleExp_${message.author.id}`, 10);
                } else if(loser == message.author) {
                    db.add(`battleExp_${target.id}`, 10);
                }//if opponent forfeits 10xp gained
            } else {
                if(winner == 'draw') {
                    db.add(`battleExp_${target.id}`, 40);
                    db.add(`battleExp_${message.author.id}`, 40);
                } else {
                    db.add(`battleExp_${winner.id}`, 50);
                    db.add(`battleWins_${winner.id}`, 1);
                    db.add(`battleExp_${loser.id}`, 25);
                }
                
            }

        }
    }
}

module.exports = battleUser;