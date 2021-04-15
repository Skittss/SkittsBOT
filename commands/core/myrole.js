const commando = require('discord.js-commando');

function isHexaColor(sNum){
    return (typeof sNum === "string") && sNum.length === 6 
           && ! isNaN( parseInt(sNum, 16) );
}

class myrole extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'myrole',
            group: 'core',
            memberName: 'myrole',
            description: 'Change the colour of your custom role',
            examples: ['myrole <role name> <#hex color>']
        });
    }
    
    async run(message, args) {
        if(!args) return message.reply("Command usage: `.myrole <role name> <#hex>`")

        var args = args.split(" ");

        let hexcolor = args.join(" ").slice(-7);

        if(!hexcolor) return message.reply("You didn't specify a color! ;-;");
        if(hexcolor.length != 7||hexcolor[0]!='#'||!isHexaColor(hexcolor.substring(1))) return message.reply("That isn't a valid hex color! ;-;");

        let nRole2 = args.toString().slice(0,-8);
        let nRole = nRole2.replace(/,/g, ' ');

        if(!nRole) return message.reply("You didn't specify your role! ;-;");

        let gRole = message.guild.roles.find('name', nRole);
        if(!gRole) return message.reply("That isn't your role!");

        let roleowner = (gRole.members.map(m=>m.user));
        let message_sender = "<@"+message.author.id+">";
        let strroleowner = (Object.values(roleowner)).toString();
        if(strroleowner != message_sender) return message.reply("That isn't your role!");
        
        gRole.edit({ color: hexcolor });

        message.channel.send({embed: {
            color: parseInt(hexcolor.substring(1), 16),
            description: "Role " + nRole + " color updated to '" + hexcolor + "'"
        }});
    }
}

module.exports = myrole;