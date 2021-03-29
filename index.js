const Discord = require('discord.js');
const mongoose = require('mongoose');
const config = require('config');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const commandHandler = require('./commands/commandHandler');

const User = require('./models/User');

connectDB();
const client = new Discord.Client();

// Event listener for bot ready
client.once('ready', () => {
    console.log('Bot online');
});

// Event listener for server join
client.on('guildMemberAdd', async (member) => {
    const { id, displayName } = member;

    let response;
    const channel = member.guild.channels.cache.find(
        (ch) => ch.name === config.get('botConfig.welcomeChannel')
    );

    try {
        let user = await User.findOne({ discordID: id });
        if (user) {
            response = `Welcome back to the server, ${member}! We missed you!`;
        } else {
            // Generate new user object
            user = new User({
                discordID: id,
                displayName: displayName,
            });

            await user.save();

            response = `Welcome to the server, ${member}!`;
        }

        if (!channel) {
            return console.log('Welcome channel not found');
        }

        channel.send(response);
    } catch (error) {
        console.error(error.message);
    }
});

// Event listener for messages
client.on('message', (message) => {
    if (message.author.bot) return;

    // Message contains a command, dispatch to handler
    if (message.content.startsWith(config.get('botConfig.prefix'))) {
        return commandHandler(message);
    }
});

// Event listener for voice channels
client.on('voiceStateUpdate', async (oldState, newState) => {
    const { member, guild, channel } = newState;

    if (!channel) return;

    // Lobbies
    if (channel.name === config.get('botConfig.lobbyChannel')) {
        const lobbyCategory = guild.channels.cache.find(
            (channel) => channel.name === config.get('botConfig.lobbyCategory')
        );

        try {
            console.log;
            // Create a new voice channel and new text channel, move user into it
            const lobbyVoice = await guild.channels.create(
                `${member.displayName}'s Lobby`,
                {
                    type: 'voice',
                    parent: lobbyCategory,
                }
            );

            const lobbyText = await guild.channels.create(
                `${member.displayName}-text`,
                {
                    parent: lobbyCategory,
                }
            );

            member.voice.setChannel(lobbyVoice);
        } catch (error) {
            console.error('Error creating lobby');
        }
    }
});

client.login(process.env.BOT_TOKEN);
