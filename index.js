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
            if (object[i].operations[0][0] === "transfer") {
                var op = object[i].operations[0][1]
                console.log(op)
                var block = object[i].block_num
                if (op.memo.includes('Project=Fundition-')) {
                    op.memo = op.memo.replace("/", "°")
                    if (op.memo) {
                        var memo = op.memo.split(" ")
                        if (memo[1].split('=')[1])
                            var name = memo[1].split('=')[1]
                        else {
                            var name = 'anonymous'
                        }
                        fundition.writeDonation(block, name, op, memo)
                    }

                }
            }
            if (object[i].operations[0][0] === "custom_json" && object[i].operations[0][1].id === "dw-fight") {
                try {
                    var fight = JSON.parse(object[i].operations[0][1].json)
                    battle.checkForABattle(fight.user_id, function (error) {
                        if (error) {
                            console.log(error)
                        }
                    })

                } catch (error) {
                    console.log(error)
                }
            }
            if (object[i].operations[0][0] === "custom_json" && object[i].operations[0][1].id === "dw-char") {
                try {
                    var json = JSON.parse(object[i].operations[0][1].json)
                    player.checkForPlayer(json.username, function (exist) {
                        if (!exist) {
                            player.createNewPlayer(json.username, json.icon, function (error) {
                                if (error) {
                                    console.log("couldnt create charachter")
                                }
                            })
                        }
                    })
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }
})
    .on('end', function () {
        // done
        console.log('END');
    });



