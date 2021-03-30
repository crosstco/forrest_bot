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
                return member.voice.setChannel(lobby.channels.voice);
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
            //lobby.isActive = true;

            await lobby.save();

            // member.voice.setChannel(lobby.channels.voice);
        } catch (error) {
            console.error(error);
        }
    },
    async deleteLobby(member) {},
};

module.exports = lobbyHandler;
