

const _ = require('lodash');
const express = require('express');
const SocketServer = require('ws').Server;
const { Client } = require('busyjs');
const sdk = require('sc2-sdk');
const bodyParser = require('body-parser');
const redis = require('./helpers/redis');
const utils = require('./helpers/utils');
const router = require('./routes');
const notificationUtils = require('./helpers/expoNotifications');

const NOTIFICATION_EXPIRY = 5 * 24 * 3600;
const LIMIT = 25;

const sc2 = sdk.Initialize({ app: 'busy.app' });

const app = express();
app.use(bodyParser.json());
app.use('/', router);

const port = process.env.PORT || 4000;
const server = app.listen(port, () => console.log(`Listening on ${port}`));

const wss = new SocketServer({ server });

const steemdWsUrl = process.env.STEEMD_WS_URL || 'wss://rpc.buildteam.io';
const client = new Client(steemdWsUrl);
const dsteem = require('dsteem');


const port = process.env.PORT || 4000;
const server = app.listen(port, () => console.log(`Listening on ${port}`));
console.log('listening on port 5000');


const client = new Client('https://api.steemit.com')

for await (const block of client.blockchain.getBlocks()) {
    console.log(`New block, id: ${ block.block_id }`)
}