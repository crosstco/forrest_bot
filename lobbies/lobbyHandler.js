const config = require('config');
const { Message } = require('discord.js');

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
                permissionOverwrites:
                    lobby.type === 'private'
                        ? [
                              {
                                  id: guild.roles.everyone.id,
                                  deny: ['VIEW_CHANNEL'],
                              },
                              {
                                  id: id,
                                  allow: ['VIEW_CHANNEL'],
                              },
                          ]
                        : [],
            });
            lobby.channels.voice = lobbyVoice.id;

            // Create matching text channel
            const lobbyText = await guild.channels.create(
                `${lobby.name}-text`,
                {
                    parent: lobbyCategory,
                    permissionOverwrites:
                        lobby.type === 'private'
                            ? [
                                  {
                                      id: guild.roles.everyone.id,
                                      deny: ['VIEW_CHANNEL'],
                                  },
                                  {
                                      id: id,
                                      allow: ['VIEW_CHANNEL'],
                                  },
                              ]
                            : [],
                }
            );
            lobby.channels.text = lobbyText.id;

            lobby.isActive = true;
            await lobby.save();

            member.voice.setChannel(lobby.channels.voice);

            await lobbyText.send(
                `Welcome to your lobby, ${member}! Try the \`!config\` command to change its name, topic, or visibility to the rest of the server!`
            );

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
        const { guild } = member;

        try {
            let lobby = await Lobby.findOneAndUpdate(
                { owner: member.id },
                { $set: options },
                { new: true }
            );

            if (!lobby) return;

            // Resolve the lobby's channels
            const voiceChannel = guild.channels.resolve(lobby.channels.voice);
            const textChannel = guild.channels.resolve(lobby.channels.text);

            // Pull out the updated options
            const { name, topic, type } = options;

            // Update the names
            if (name) {
                await voiceChannel.setName(name);
                await textChannel.setName(name);
            }

            // Update the topic
            if (topic) {
                await voiceChannel.setTopic(topic);
                await textChannel.setTopic(topic);
            }

            // Update the visibility
            if (type) {
                // Public: Make the channels visible to everyone
                if (type === 'public') {
                    await voiceChannel.overwritePermissions([
                        {
                            id: guild.roles.everyone.id,
                            allow: ['VIEW_CHANNEL'],
                        },
                    ]);
                    await textChannel.overwritePermissions([
                        {
                            id: guild.roles.everyone.id,
                            allow: ['VIEW_CHANNEL'],
                        },
                    ]);
                }

                // Private: Make the channels only visible to the member and mods.
                if (type === 'private') {
                    await voiceChannel.overwritePermissions([
                        {
                            id: guild.roles.everyone.id,
                            deny: ['VIEW_CHANNEL'],
                        },
                        {
                            id: id,
                            allow: ['VIEW_CHANNEL'],
                        },
                    ]);

                    await textChannel.overwritePermissions([
                        {
                            id: guild.roles.everyone.id,
                            deny: ['VIEW_CHANNEL'],
                        },
                        {
                            id: id,
                            allow: ['VIEW_CHANNEL'],
                        },
                    ]);
                }
            }
        } catch (error) {
            console.error(error);
        }
    },
};

module.exports = lobbyHandler;
