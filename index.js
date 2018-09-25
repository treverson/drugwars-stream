
const express = require('express');
const SocketServer = require('ws').Server;
const dsteem = require('dsteem');


const app = express();

const client = new Client(steemdWsUrl);

const port = process.env.PORT || 5000;
const server = app.listen(port, () => console.log(`Listening on ${port}`));
console.log('listening on port 5000');


const client = new Client('https://api.steemit.com')

for await (const block of client.blockchain.getBlocks()) {
    console.log(`New block, id: ${ block.block_id }`)
}