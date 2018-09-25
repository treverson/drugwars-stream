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

stream.on('data', function (block) {
        if (block.transactions[0] != undefined) {
            console.log('block ' + block.block_id)
            var object = JSON.stringify(block.transactions)
            object.replace('\\', '')
            object = JSON.parse(object) 
            for (i = 0; i < object.length; i++) {
                var operation = object[i].operations
                if (operation[0][0] === 'transfer') {
                    console.log('transfer operation')
                    console.log(operation[0].from)
                }

            }

            // if(object[0].operations)
            // {
            //     var type = object[0].operations[0][0]
            //     if(type === 'transfer')
            //     {
            //         console.log('transfer')
            //         console.log(object[0].operations[0][0])
            //     }

            //     if(object[1].operations[0][0])
            //     {
            //         var type2 = object[1].operations[0][0]
            //         if(type2 === 'transfer')
            //         {
            //             console.log('transfer2')
            //             console.log(object[1].operations[0][0])
            //         }
            //     }

            // }

        }
})
    .on('end', function () {
        // done
        console.log('END');
    });