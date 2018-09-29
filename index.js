const { Client, BlockchainMode } = require('dsteem');

var mysql = require('mysql');
const express = require('express')
var es = require('event-stream')
var util = require('util')
const fs = require('fs');
const app = express()
const port = process.env.PORT || 4000

var player = require('./operations/player_handler')
var battle = require('./operations/battle_handler')
var shop = require('./operations/shop_handler')


app.listen(port, () => console.log(`Listening on ${port}`));
battle.createBattle(555)

var client = new Client('https://api.steemit.com')

var stream = client.blockchain.getBlockStream({ mode: BlockchainMode.Latest })

var maxpic = 5;

var count = 0;
stream.on("data", function (block) {
    try {
        var object = JSON.stringify(block.transactions)
        object.replace("\\", "")
        object = JSON.parse(object)
        for (i = 0; i < object.length; i++) {
            var transaction;
           if (object[i].operations[0][0] === "transfer" && object[i].operations[0][1].to === "ongame") {
                console.log("Transfer block for Ongame " + block.block_id)
                transaction = object[i].operations[0][1]
                player.checkForPlayer(transaction.from, function (exist) {
                    if (exist) {
                        console.log("Transfer block " + block.block_id)
                        shop.StartTransaction(transaction, function (error) {
                            if (error)
                                console.log(error)
                        })
                    }
                    else {
                        console.log("New player creation")
                        player.createNewPlayer(transaction, function (error) {
                            if (error) {
                                console.log("couldnt create charachter")
                            }
                            else {
                                shop.StartTransaction(transaction, function (error) {
                                    if (error)
                                        console.log(error)
                                })
                            }
                        })
                    }
                })
           }
        }
    } catch (error) {
        console.log(error)
    }
})
    .on('end', function () {
        // done
        console.log('END');
    });


