const lobbyHandler = require('../../lobbies/lobbyHandler');

const getSingleResponse = async (message) => {
    const { author, channel } = message;

    const filter = (m) => m.author === author;

    response = (await channel.awaitMessages(filter, { max: 1 }))
        .entries()
        .next().value[1].content;

    return response;
};

const getYesOrNoResponse = async (message) => {
    do {
        message.channel.send('Please enter "y" or "n"');
        let response = await getSingleResponse(message);
    } while (response.toLowerCase() !== 'y' && response.toLowerCase() !== 'n');

    return response.toLowerCase();
};

module.exports = {
    name: 'config',
    aliases: [
        'lobby-config',
        'config-lobby',
        'lobbies-config',
        'config-lobbies',
    ],
    description: 'Configure a lobby on the server',
    guildOnly: true,
    args: false,
    async execute(message, args) {
        const { member, guild, channel } = message;

        const lobby = await lobbyHandler.getLobby(member);

        // Has the user create a lobby before?
        if (!lobby)
            return message.reply(
                "You've never created a lobby before. Try joining the 'Create a Lobby' voice channel first"
            );

        // Is the command being run from the lobby owner's text channel?
        if (!lobby.channels || lobby.channels.text !== channel.id) {
            let reply =
                "it looks like you're trying to execute this outside of your lobby's text channel.";
            if (lobby.isActive) {
                reply += ` Try this command again in ${guild.channels.resolve(
                    lobby.channels.text
                )}`;
            } else {
                reply +=
                    " It's not active right now, so try opening it first by joining the 'Create a Lobby' voice channel";
            }

            return message.reply(reply);
        }

        // Begin config walkthrough

        // Create new object
        const configFields = {};

        // Only listen for replies from the owner who made the config call
        const filter = (m) => m.author === message.author;

        channel.send(
            `I'll walk you through changing your lobby's settings.\n\nThis lobby is currently called "${lobby.name}." Would you like to change it?`
        );

        // Await a yes or no response
        let response = await getYesOrNoResponse(message);
        // If yes, await a word, otherwise use current name
        if (response === 'y') {
            channel.send('Please enter a name for your lobby.');
            configFields.name = await getSingleResponse(message);
        }

        // Ask for topic set/change
        if (lobby.topic) {
            channel.send(
                `This lobby currently has its topic set to "${lobby.topic}." Would you like to change it?`
            );
        } else {
            channel.send('Would you like to set a topic for this lobby?');
        }

        // Await a yes or no response
        response = await getYesOrNoResponse(message);
        // If yes,
        if (response === 'y') {
            channel.send('Please enter a topic for your lobby.');
            configFields.topic = await getSingleResponse(message);
        }

        // Visibility
        channel.send(
            `Your lobby's visibility is currently ${
                lobby.type
            }. Would you like to change it to ${
                lobby.type === 'public' ? 'private' : 'public'
            }?`
        );

        response = await getYesOrNoResponse(message);
        // If yes
        if (response === 'y') {
            configFields.type = lobby.type === 'public' ? 'private' : 'public';
            channel.send(
                `The visibility will be changed to ${configFields.type}`
            );
        } else {
            channel.send(`The visibility will remain ${lobby.type}`);
        }

        let configChanges = 'Your config changes:';
        configChanges += `\nName: ${lobby.name} => ${
            configFields.name ? configFields.name : lobby.name
        }`;
        configChanges += `\nTopic: ${lobby.topic} => ${
            configFields.topic ? configFields.topic : lobby.topic
        }`;
        configChanges += `\nVisibility: ${lobby.type} => ${
            configFields.type ? configFields.type : lobby.type
        }`;

        message.reply(configChanges);

        lobbyHandler.updateLobby(member, configFields);
    },
};
