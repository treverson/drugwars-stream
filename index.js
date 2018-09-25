
const express = require('express');
const SocketServer = require('ws').Server;
const {Client} = require('dsteem')


const app = express();

const port = process.env.PORT || 5000;
const server = app.listen(port, () => console.log(`Listening on ${port}`));
console.log('listening on port 5000');




const client = new Client('https://api.steemit.com')

async function main() {
    const props = await client.database.getChainProperties()
    console.log(`Maximum blocksize consensus: ${ props.maximum_block_size } bytes`)
    client.disconnect()
}

main().catch(console.error)