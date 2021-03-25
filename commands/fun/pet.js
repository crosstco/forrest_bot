module.exports = {
    name: 'pet',
    aliases: ['treat', 'good-boy', 'goodboy'],
    description: 'Reward Forrest and get a random response',
    args: false,
    execute(message, args) {
        const responses = ['*Wags tail*', 'Bark bark!', '*Heavy panting*'];
        const responseNum = Math.floor(
            Math.random() * Math.floor(responses.length)
        );

        message.channel.send(responses[responseNum]);
    },
};
