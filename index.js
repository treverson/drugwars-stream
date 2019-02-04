const express = require('express')
const app = express()
const port = process.env.PORT || 4000
var bc_operation = require('./utils/filteroperation')

const { Client, BlockchainMode, PrivateKey } = require('dsteem');
var client = new Client('https://api.steemit.com')

app.listen(port, () => console.log(`Listening on ${port}`));

var stream = client.blockchain.getBlockStream({ mode: BlockchainMode.Latest })

battle.loadAttacks()

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
            battle.checkAttacks(object[i].block_num)
            bc_operation.filter(object[i])
        }
    }
})
    .on('end', function () {
        // done
        console.log('END');
    });



