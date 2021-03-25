const Discord = require('discord.js');
const fs = require('fs');

const { prefix } = require('../config/config.json');

// LOAD COMMAND FILES

const commands = new Discord.Collection();

// Read in all directories in this current directory, ignoring other files
const commandFolders = fs
    .readdirSync(__dirname, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

for (const folder of commandFolders) {
    // Read files in every folder that end in .js
    const commandFiles = fs
        .readdirSync(`${__dirname}/${folder}`)
        .filter((file) => file.endsWith('.js'));

    // Require all .js files
    for (const file of commandFiles) {
        const command = require(`${__dirname}/${folder}/${file}`);
        commands.set(command.name, command);
    }
}

const commandHandler = (message) => {
    // Extract command name and argument from the message.
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Extract command from command file
    const command =
        // Get command from its name
        commands.get(commandName) ||
        // Get command from an alias
        commands.find(
            (commandObject) =>
                commandObject.aliases &&
                commandObject.aliases.includes(commandName)
        );

    if (!command) return;

    // If a command is guildOnly, it should not execute in a DM
    if (command.guildOnly && message.channel.type == 'dm') {
        return message.reply("I can't execute this command inside a DM");
    }

    // Users without permissions for a command, should not be able to execute it
    if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            return message.reply(
                'You do not have permission to execute this command'
            );
        }
    }

    // If a command requires arguments, and none are provided, inform the user
    if (command.args && !args.length) {
        let reply = 'This command requires arguments';

        if (command.usage) {
            reply += `\n${command.usage}`;
        }

        return message.channel.send(reply);
    }

    // Execute the command
    try {
        command.execute(message, args);
    } catch {
        console.error(error);
        message.reply('There was an error trying to execute the command');
    }
};

module.exports = commandHandler;
