const { Client, BlockchainMode } = require('dsteem');
const express = require('express')
const app = express()
const port = process.env.PORT || 4000
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var battle = require('./operations/battle_handler')
var player = require('./operations/player_handler')
var shop = require('./operations/shop_handler')
var building = require('./operations/building_handler')
var client = new Client('https://api.steemit.com')

app.listen(port, () => console.log(`Listening on ${port}`));

var stream = client.blockchain.getBlockStream({ mode: BlockchainMode.Latest })


transferForShop = function (transaction) {
    player.getPlayerId(transaction.from, function (exist) {
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
                } catch (error) {
                    console.log(error)
                }
                player.getPlayerId(json.username, function (exist) {
                    if (!exist) {
                        player.createNewPlayer(json.username, json.icon, function (error) {
                            if (error) {
                                console.log("couldnt create charachter")
                            }
                        })
                    }
                })
            }
            if (object[i].operations[0][0] === "custom_json" && object[i].operations[0][1].id === "dw-upgrade") {
                try {
                    var json = JSON.parse(object[i].operations[0][1].json)
                } catch (error) {
                    console.log(error)
                }
                player.getPlayerId(json.username, function (user_id) {
                    if (user_id) {
                        player.updateGetPlayer(user_id,function(player){
                            if(player)
                            building.AddLevelToPlayerBuilding(player,json.building,function(result){
                                if(result)
                                console.log(result)
                                // building.checkForBuildingTime(json.building,level,function(time){
                                //     if(time)
                                //     console.log(time)    
                                //     // player.addLevelToPlayerBuilding(user.user_id,json.building,function(error){
                                //     //     if(error)
                                //     //     console.log(error)
                                //     // })
                                // })
                            })
                        })
                    }
                })
            }
            if (object[i].operations[0][0] === "transfer" && object[i].operations[0][1].to === "drugwars-dealer") {
                try {
                    var json = object[i].operations[0][1]
                } catch (error) {
                    console.log(error)
                }
                player.getPlayerId(json.from, function (user_id) {
                    if (user_id) {
                        player.updateGetPlayer(user_id,function(player){
                            if(player)
                            building.AddLevelToPlayerBuildingSteem(player,json.building,json.amount,function(result){
                                if(result)
                                console.log(result)
                                if(result ==="success")
                                {
                                    var amount = parseFloat(json.amount.split(' ')[1]).toFixed(3)
                                    amount = (amount/100)*89
                                    amount = amount + ' STEEM'
                                    client.broadcast.transfer({
                                        from: 'drugwars-dealer',
                                        to: 'drugwars',
                                        amount: amount,
                                        memo: 'Pool contribution',
                                    }, process.env.DW_DEALER_KEY)
                                }
                            })
                        })
                    }
                })
            }
        }
    }
})
    .on('end', function () {
        // done
        console.log('END');
    });



