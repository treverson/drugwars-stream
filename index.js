
const express = require('express');
const SocketServer = require('ws').Server;
const {Client} = require('dsteem')


const app = express();

const port = process.env.PORT || 5000;
const server = app.listen(port, () => console.log(`Listening on ${port}`));
console.log('listening on port 5000');




const client = new Client('https://api.steemit.com')

var dsteem = require('dsteem')

var client = new dsteem.Client('https://api.steemit.com')

for (const block of client.blockchain.getBlocks()) {
    console.log(`New block, id: ${ block.block_id }`)
}