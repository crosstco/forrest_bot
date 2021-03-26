const Discord = require('discord.js');
const config = require('config');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const commandHandler = require('./commands/commandHandler');

connectDB();
const client = new Discord.Client();

// Event listener for bot ready
client.once('ready', () => {
    console.log('Bot online');
});

// Event listener for messages
client.on('message', (message) => {
    if (message.author.bot) return;

    // Message contains a command, dispatch to handler
    if (message.content.startsWith(config.get('botConfig.prefix'))) {
        return commandHandler(message);
    }
});

client.login(process.env.BOT_TOKEN);
