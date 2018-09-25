const express = require('express');

import {Client} from 'dsteem'
console.log('Starting App')
const app = express();
const server = app.listen(port, () => console.log(`Listening on ${port}`));

const client = new Client('https://api.steemit.com')

for await (const block of client.blockchain.getBlocks()) {
    console.log(`New block, id: ${ block.block_id }`)
}