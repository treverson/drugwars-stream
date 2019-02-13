const Promise = require('bluebird');
const Discord = require('discord.js');
const db = require('./db');

const token = process.env.DISCORD_TOKEN;
const channel = process.env.DISCORD_CHANNEL;
const client = new Discord.Client();
let speaker;

const getHeistMessage = () => new Promise((resolve, reject) => {
  let message = 'Heist current positions \n';
  let i = 0;
  db.queryAsync('SELECT * FROM heist ORDER BY drugs DESC LIMIT 20').then(users => {
    users.forEach(user => {
      i++;
      message += `\n**${i}: ${user.username}** ${user.drugs} DRUGS`;
    });
    resolve(message);
  }).catch(e => {
    console.log('Query heist message failed', e);
    reject();
  });
});

const getDailyMessage = () => new Promise((resolve, reject) => {
  let message = 'Drug production rate current positions \n';
  let i = 0;
  db.queryAsync('SELECT * FROM users ORDER BY drug_production_rate DESC LIMIT 20').then(users => {
    users.forEach(user => {
      i++;
      message += `\n**${i}: ${user.username}** ${user.drug_production_rate} DRUGS /sec`;
    });
    resolve(message);
  }).catch(e => {
    console.log('Query daily message failed', e);
    reject();
  });
});

client.on('ready', () => {
  console.log(`Bot logged in as ${client.user.tag}!`);
  speaker = client.channels.get(channel);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }

  if (msg.content === '$heist') {
    getHeistMessage().then(message => {
      msg.reply(message);
    });
  }

  if (msg.content === '$daily') {
    getDailyMessage().then(message => {
      msg.reply(message);
    });
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
