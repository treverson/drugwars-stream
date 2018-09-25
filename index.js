var dsteem = require('dsteem')
const express = require('express')
var es = require('event-stream') 
var util = require('util')
const app = express()
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on ${port}`));
console.log('listening on port 5000');

var client = new dsteem.Client('https://api.steemit.com')

var stream = client.blockchain.getBlockStream()

// stream.pipe(es.map(function(block, callback) {
//     console.log(block)
//     callback(null, util.inspect(block, {colors: true, depth: null}) + '\n')
// })).pipe(process.stdout) 


stream
.on('data', function(block) {

    try {
        var newblock = JSON.parse(JSON.stringify(block))
    } catch (e) {

    }
    console.log("ID :" + block.block_id)
    console.log('Block : ' + JSON.parse(newblock.transactions))
    // console.log("Transactions :" + transactions)
    // console.log("Operations :" + block.transactions.operations)
    // blocks.unshift(
    //     `<div class="list-group-item"><h5 class="list-group-item-heading">Block id: ${
    //         block.block_id
    //     }</h5><p>Transactions in this block: ${
    //         block.transactions.length
    //     } <br>Witness: ${
    //         block.witness
    //     }</p><p class="list-group-item-text text-right text-nowrap">Timestamp: ${
    //         block.timestamp
    //     }</p></div>`
    // );
    // document.getElementById('blockList').innerHTML = blocks.join('');
})
.on('end', function() {
    // done
    console.log('END');
});

function checkTransaction(block){
    if(!block.transactions.operations) return
    console.log(JSON.parse(block.transactions.operations))
}
