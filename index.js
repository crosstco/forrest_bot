const Discord = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const commandHandler = require('./commands/commandHandler');
const { prefix } = require('./config/config.json');

const client = new Discord.Client();

// Event listener for bot ready
client.once('ready', () => {
    console.log('Bot online');
});

// Event listener for messages
client.on('message', (message) => {
    if (message.author.bot) return;

    // Message contains a command, dispatch to handler
    if (message.content.startsWith(prefix)) return commandHandler(message);
});

client.login(process.env.BOT_TOKEN);
