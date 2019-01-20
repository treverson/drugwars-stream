const { Client, BlockchainMode } = require('dsteem');
const express = require('express')
const app = express()
const port = process.env.PORT || 4000
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var battle = require('./operations/battle_handler')
var player = require('./operations/player_handler')
var shop = require('./operations/shop_handler')
var client = new Client('https://api.steemit.com')

app.listen(port, () => console.log(`Listening on ${port}`));

var stream = client.blockchain.getBlockStream({ mode: BlockchainMode.Latest })


transferForShop = function (transaction) {
    player.checkForPlayer(transaction.from, function (exist) {
        if (exist) {
            shop.StartTransaction(transaction, function (error) {
                if (error)
                    console.log(error)
            })
        }
    })
}

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

            if (object[i].operations[0][0] === "transfer" && object[i].operations[0][1].to === "drugwars") {
                transferForShop(object[i].operations[0][1])
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



