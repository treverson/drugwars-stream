const { Client, BlockchainMode } = require('dsteem');
const express = require('express')
const app = express()
const port = process.env.PORT || 4000
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var ongame = require('./operations/ongame_handler')
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
            if (object[i].operations[0][0] === "comment") {
                var content = object[i].operations[0][1]
                try {
                    content.json_metadata = JSON.parse(content.json_metadata)
                }
                catch (e) {
                }
                if (content.json_metadata.tags) {
                    for (b = 0; content.json_metadata.tags.length > b; b++) {
                        if (content.json_metadata.tags[b].includes('ongame-') && content.parent_author === '') {
                            ongame.insertItem(ongame.parseContent(content), function (error) {
                                if (error)
                                    console.log(error)
                            })
                            return
                        }
                    }
                }
            }
        }
    }
})
    .on('end', function () {
        // done
        console.log('END');
    });



