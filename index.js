const express = require('express')
const app = express()
const port = process.env.PORT || 4000
var bc_operation = require('./utils/filteroperation')

const { Client, BlockchainMode, PrivateKey } = require('dsteem');
var client = new Client('https://api.steemit.com')

app.listen(port, () => console.log(`Listening on ${port}`));

var stream = client.blockchain.getBlockStream({ mode: BlockchainMode.Latest })

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
            bc_operation.filter(object[i])
        }
    }
})
    .on('end', function () {
        // done
        console.log('END');
    });



