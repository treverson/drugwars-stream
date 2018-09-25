
const port = process.env.PORT || 4000;
const server = app.listen(port, () => console.log(`Listening on ${port}`));
console.log('listening on port 5000');

const dsteem = require('dsteem');

import {Client} from 'dsteem'

const client = new Client('https://api.steemit.com')

for await (const block of client.blockchain.getBlocks()) {
    console.log(`New block, id: ${ block.block_id }`)
}