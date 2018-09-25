
const express = require('express');
const SocketServer = require('ws').Server;
var dsteem = require('dsteem')

const app = express();

const port = process.env.PORT || 5000;
const server = app.listen(port, () => console.log(`Listening on ${port}`));
console.log('listening on port 5000');




var client = new dsteem.Client('https://api.steemit.com')

for (const block of client.blockchain.getBlocks()) {
    console.log(`New block, id: ${ block.block_id }`)
}