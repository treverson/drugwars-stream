const { Client, BlockchainMode, PrivateKey } = require('dsteem');
const express = require('express')
const app = express()
const port = process.env.PORT || 4000
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var battle = require('./operations/battle_handler')
var player = require('./operations/player_handler')
var shop = require('./operations/shop_handler')
var building = require('./operations/building_handler')
var heist = require('./operations/heist_handler')
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
                        player.createNewPlayer(json.username, json.icon, json.referrer, function (error) {
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
                            })
                        })
                    }
                })
            }
            if (object[i].operations[0][0] === "custom_json" && object[i].operations[0][1].id === "dw-heist") {
                try {
                    var json = JSON.parse(object[i].operations[0][1].json)
                } catch (error) {
                    console.log(error)
                }
                player.getPlayerId(json.username, function (user_id) {
                    if (user_id) {
                        player.updateGetPlayer(user_id,function(player){
                            if(player)
                            {
                                amount = Number(json.memo.split(':')[1])
                            }
                            heist.addToPool(player,amount,function(result){
                                if(result)
                                console.log(result)
                            })
                        })
                    }
                })
            }
            if (object[i].operations[0][0] === "transfer" && object[i].operations[0][1].to === "drugwars-dealer") {
                var json = object[i].operations[0][1]
                player.getPlayerId(json.from, function (user_id) {
                    if (user_id) {
                        player.updateGetPlayer(user_id,function(player){
                            if(player)
                            {
                                building_id = Number(json.memo.split(':')[1])
                                console.log(json)
                                if(json.memo.split(':')[0]==="upgrade")
                                {
                                    building.AddLevelToPlayerBuildingSteem(player,building_id,json.amount,function(result){
                                        if(result)
                                        console.log(result)
                                        if(result ==="success")
                                        {
                                            var amount = json.amount.split(' ')[0]
                                            amount = (amount/100)*89
                                            amount = parseFloat(amount).toFixed(3)
                                            const transfer = amount.concat(' ', 'STEEM');
                                            const transf = new Object();
                                            transf.from = 'drugwars-dealer';
                                            transf.to = 'drugwars';
                                            transf.amount = transfer;
                                            transf.memo = 'Pool contribution';
                                            client.broadcast.transfer(transf, PrivateKey.fromString(process.env.DW_DEALER_KEY)).then(
                                                function(result) {
                                                    console.log(
                                                        'sent:' + transfer,
                                                        'included in block: ' + result.block_num,
                                                    );
                                                },
                                                function(error) {
                                                    console.error(error);
                                                }
                                            )
                                        }
                                    })
                                }
                            }
                           
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



