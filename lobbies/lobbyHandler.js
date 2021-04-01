const config = require('config');

const Lobby = require('../models/Lobby');

const lobbyHandler = {
    async createLobbyForMember(member) {
        const { id, displayName, guild } = member;

        // Find the category to place the new lobby
        const lobbyCategory = guild.channels.cache.find(
            (channel) => channel.name === config.get('botConfig.lobbyCategory')
        );

        try {
            let lobby = await Lobby.findOne({ owner: id });

            if (!lobby) {
                // Create default lobby
                lobby = new Lobby({
                    owner: id,
                    name: `${displayName}'s Lobby`,
                });
            } else if (lobby.isActive) {
                // Simply move the user back into their lobby
                member.voice.setChannel(lobby.channels.voice);
                return lobby.channels.voice;
            }

            // Create new voice channel
            const lobbyVoice = await guild.channels.create(lobby.name, {
                type: 'voice',
                parent: lobbyCategory,
            });

            // Create matching text channel
            const lobbyText = await guild.channels.create(
                `${lobby.name}-text`,
                {
                    parent: lobbyCategory,
                }
            );

            lobby.channels.voice = lobbyVoice.id;
            lobby.channels.text = lobbyText.id;
            lobby.isActive = true;
            await lobby.save();

            member.voice.setChannel(lobby.channels.voice);

            return lobby.channels.voice;
        } catch (error) {
            console.error(error);
        }
    },
    async deleteLobbyChannels(voiceChannel) {
        const { id, guild } = voiceChannel;

        try {
            // Find the lobby that is using this voice channel's id
            let lobby = await Lobby.findOne({ 'channels.voice': id });

            if (!lobby) return;

            // Delete the channels of this lobby
            await guild.channels.resolve(lobby.channels.voice).delete();
            await guild.channels.resolve(lobby.channels.text).delete();

            // Set the lobby settings accordingly
            lobby.channels = undefined;
            lobby.isActive = false;
            await lobby.save();
        } catch (error) {
            console.error(error);
        }
    },
    async getLobby(member) {
        try {
            let lobby = await Lobby.findOne({ owner: member.id });
            return lobby;
        } catch (error) {
            console.error(error);
        }
    },
    async updateLobby(member, options) {
        try {
            let lobby = await Lobby.findOneAndUpdate(
                { owner: member.id },
                { $set: options },
                { new: true }
            );
        } catch (error) {
            console.error(error);
        }
    },
};

module.exports = lobbyHandler;
