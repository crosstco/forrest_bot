const Discord = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const client = new Discord.Client();

client.once('ready', () => {
    console.log('Bot online');
});

client.login(process.env.BOT_TOKEN);
