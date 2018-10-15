const { Client, BlockchainMode } = require('dsteem');
const express = require('express')
const app = express()
const port = process.env.PORT || 4000
const sql = require('mssql')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var player = require('./operations/player_handler')
var gift = require('./operations/gift_handler')
var battle = require('./operations/battle_handler')
var shop = require('./operations/shop_handler')

var client = new Client('https://api.steemit.com')

app.listen(port, () => console.log(`Listening on ${port}`));

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

function SBD() {

}

function WriteDonation(block,name,op,memo) {
    if (op.amount.split(' ')[1] === 'STEEM') {
        var xtr = new XMLHttpRequest();
        xtr.open('GET', 'https://api.coinmarketcap.com/v1/ticker/steem/', true);
        xtr.send();
        xtr.onreadystatechange = function () {
            if (xtr.readyState == 4) {
                if (xtr.status == 200) {
                    if (xtr.responseText) {
                        var ticker = JSON.parse(xtr.responseText)
                        totalUSD = ticker[0].price_usd
                        console.log(totalUSD)
                        var amount = op.amount.split(' ')[0];
                        amount = Number(parseFloat(amount).toFixed(3)) * Number(parseFloat(totalUSD).toFixed(3))
                        var xtr = new XMLHttpRequest();
                        xtr.open('GET', 'https://ongameapi.herokuapp.com/api/adddonation/' + block + "/" + name + "/" + op.to + "/" + amount + "/" + memo + "/" + op.amount, true);
                        xtr.send();
                        xtr.onreadystatechange = function () {
                            if (xtr.readyState == 4) {
                                if (xtr.status == 200) {
                                    if (xtr.responseText) {
                                        console.log(xtr.responseText)
                                    }
                                } else {
                                    console.log("Error: API not responding!");
                                }
                            }
                        }
                    }
                } else {
                    console.log("Error: API not responding!");
                }
            }
        }
    }
    else {
        var xtr = new XMLHttpRequest();
        xtr.open('GET', 'https://api.coinmarketcap.com/v1/ticker/steem-dollars/', true);
        xtr.send();
        xtr.onreadystatechange = function () {
            if (xtr.readyState == 4) {
                if (xtr.status == 200) {
                    if (xtr.responseText) {
                        var ticker = JSON.parse(xtr.responseText)
                        totalUSD = ticker[0].price_usd
                        console.log(totalUSD)
                        var amount = op.amount.split(' ')[0];
                        amount = Number(parseFloat(amount).toFixed(3)) * Number(parseFloat(totalUSD).toFixed(3))
                        var xtr = new XMLHttpRequest();
                        xtr.open('GET', 'https://ongameapi.herokuapp.com/api/adddonation/' + block + "/" + name + "/" + op.to + "/" + amount + "/" + memo + "/" + op.amount, true);
                        xtr.send();
                        xtr.onreadystatechange = function () {
                            if (xtr.readyState == 4) {
                                if (xtr.status == 200) {
                                    if (xtr.responseText) {
                                        console.log(xtr.responseText)
                                    }
                                } else {
                                    console.log("Error: API not responding!");
                                }
                            }
                        }
                    }
                } else {
                    console.log("Error: API not responding!");
                }
            }
        }
    }

}


var permlinks = []
var stream = client.blockchain.getBlockStream({})
stream.on("data", function (block) {
    try {
        var object = JSON.stringify(block.transactions)
        object.replace("\\", "")
        object = JSON.parse(object)
        for (i = 0; i < object.length; i++) {
            var transaction;
            if (object[i].operations[0][0] === "transfer" && object[i].operations[0][1].to === "ongame") {
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
            if (object[i].operations[0][0] === "custom_json" && object[i].operations[0][1].id === "gift-claim") {
                try {
                    var json = JSON.parse(object[i].operations[0][1].json)
                    console.log(json)
                    gift.createNewGift(json, function (error) {
                        if (!error) {
                            console.log('gift updated')
                        }
                    })
                } catch (error) {
                    console.log(error)
                }
            }
            if (object[i].operations[0][0] === "comment") {
                var json = object[i].operations[0][1]
                try {
                    json.json_metadata = JSON.parse(json.json_metadata)
                    if (json.json_metadata) {
                        if (json.json_metadata.tags) {
                            for (b = 0; json.json_metadata.tags.length > b; b++) {
                                if (json.json_metadata.tags[b].includes('fundition_') || json.json_metadata.tags[b].includes('fundition-')) {
                                    console.log('its an update from ' + json.author)
                                    var xtr = new XMLHttpRequest();
                                    xtr.open('GET', 'https://ongameapi.herokuapp.com/api/addupdate/' + json.author + "/" + json.permlink, true);
                                    xtr.send();
                                    xtr.onreadystatechange = function () {
                                        if (xtr.readyState == 4) {
                                            if (xtr.status == 200) {
                                                if (xtr.responseText) {
                                                    console.log(xtr.responseText)
                                                }
                                            } else {
                                                var xtr = new XMLHttpRequest();
                                                xtr.open('GET', 'https://ongameapi.herokuapp.com/api/updateupd/' + json.author + "/" + json.permlink, true);
                                                xtr.send();
                                                xtr.onreadystatechange = function () {
                                                    if (xtr.readyState == 4) {
                                                        if (xtr.status == 200) {
                                                            if (xtr.responseText) {
                                                                console.log(xtr.responseText)
                                                            }
                                                        } else {
                                                            console.log("Error: API not responding!");
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if (json.json_metadata.tags[b].includes('myfundition')) {
                                    console.log('its a project from ' + json.author)
                                    var xtr = new XMLHttpRequest();
                                    xtr.open('GET', 'https://ongameapi.herokuapp.com/api/addproject/' + json.author + "/" + json.permlink + "/other", true);
                                    xtr.send();
                                    xtr.onreadystatechange = function () {
                                        if (xtr.readyState == 4) {
                                            if (xtr.status == 200) {
                                                if (xtr.responseText) {
                                                    console.log(xtr.responseText)
                                                }
                                            } else {
                                                var xtr = new XMLHttpRequest();
                                                xtr.open('GET', 'https://ongameapi.herokuapp.com/api/updateproject/' + json.author + "/" + json.permlink, true);
                                                xtr.send();
                                                xtr.onreadystatechange = function () {
                                                    if (xtr.readyState == 4) {
                                                        if (xtr.status == 200) {
                                                            if (xtr.responseText) {
                                                                console.log(xtr.responseText)
                                                            }
                                                        } else {
                                                            console.log("Error: API not responding!");
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {

                }
            }
            if (object[i].operations[0][0] === "transfer") {
                var op = object[i].operations[0][1]
                var date = object[i].expiration
                var block = object[i].block_num
                if (op.memo.includes('Fundition-') || op.memo.includes('fundition-') || op.memo.includes('Project=Fundition-')) {
                    var memo = op.memo.split(" ")
                    var newperm = memo[0].split("-")
                    if (memo[0].includes('Fundition-') || memo[0].includes('fundition-') || memo[0].includes('Project=Fundition-')) {
                        var name = memo[1].split('=')[1]
                        if (op.from === "blocktrades") {
                            WriteDonation(block,name,op,memo)
                        }
                        if
                        (op.from === "fundition") {
                            WriteDonation(block,name,op,memo)
                        }
                        else {
                            WriteDonation(block,name,op,memo)
                        }

                    }
                }

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



