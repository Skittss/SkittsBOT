const commando = require('discord.js-commando');

class SetUserRole extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'userrole',
            aliases: ['customrole','cr','ur'],
            group: 'mod',
            memberName: 'userrole',
            description: 'Assign a custom colour role to a user.',
            examples: ['userrole <@user> <insert role name here>']
        });
    }

    async run(message, args) {
        //userrole @kanaga Skitts
        
        if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply("You don't have the permission to do that!");

        if(!args) return message.reply("Command usage: `.userrole <@user> <role name>`")

        var args = args.split(" ");
        
        let rMember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
        if(!rMember) return message.reply("I couldn't find that user ;-;");
        let nRole = args.join(" ").slice(22);
        if(!nRole) return message.reply("You didn't specify a role ;-;");

        let gRole = message.guild.roles.find('name', nRole);
        if(gRole) return message.reply("A role with that name already exists");

        let skittsRoleid = message.guild.roles.find('name', 'Skitts');
        let skittsPos = skittsRoleid.calculatedPosition;

        await(message.guild.createRole({
              name: nRole,
              permissions: [],
              mentionable: true
        })
        
        .then((roleCreate) => {
            if(rMember.roles.has(roleCreate.id));
            rMember.addRole(roleCreate.id);
            roleCreate.setPosition(skittsPos);
        })
        .catch((err) => {
            console.log(err)
            message.reply("aaahhhh, something went wrong! Please try again :)")
        })
        
    );
        
        message.channel.send({embed: {
            color: 3447003,
            description: "User " + rMember + " assigned to role '" + nRole + "'"
        }});
        
    }
}

module.exports = SetUserRole;