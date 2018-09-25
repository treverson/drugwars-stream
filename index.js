
var dsteem = require('dsteem')
const express = require('express')
var es = require('event-stream') 
var util = require('util')
import {Client} from 'dsteem'
const app = express()
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on ${port}`));
console.log('listening on port 5000');



const client = new Client('https://api.steemit.com')

for await (const block of client.blockchain.getBlocks()) {
    console.log(`New block, id: ${ block.block_id }`)
}