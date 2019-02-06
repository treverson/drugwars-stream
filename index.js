const express = require('express')
const app = express()
const port = process.env.PORT || 4000
var bc_operation = require('./utils/filteroperation')
var attack = require('./operations/attack_handler')
const { Client, BlockchainMode, PrivateKey } = require('dsteem');
var client = new Client('https://api.steemit.com')

app.listen(port, () => console.log(`Listening on ${port}`));

var stream = client.blockchain.getBlockStream({ mode: BlockchainMode.Latest })

client.blockchain.getCurrentBlockNum().then(res => {
    attack.loadAttacks(res)
}).catch(err => {
    console.log(err);
})

stream.on("data", function (block) {
    if (block != null) {
        try {
            var object = JSON.stringify(block.transactions)
            object.replace("\\", "")
            object = JSON.parse(object)
        } catch (error) {
            console.log(error)
        }
        for (i = 0; i < object.length; i++) {
            attack.checkAttacks(object[i])
            bc_operation.filter(object[i])
        }
    }
})
    .on('end', function () {
        // done
        console.log('END');
    });



