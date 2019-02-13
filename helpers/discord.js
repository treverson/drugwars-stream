const Discord = require('discord.js');

const token = process.env.DISCORD_TOKEN;
const channel = process.env.DISCORD_CHANNEL;
const client = new Discord.Client();
let speaker;

client.on('ready', () => {
  console.log(`Bot logged in as ${client.user.tag}!`);
  speaker = client.channels.get(channel);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
});

client.login(token);

const log = message => {
  if (speaker) {
    return speaker.send(message);
  }
  console.log(`Missing bot message: ${message}`);
};

module.exports = log;
