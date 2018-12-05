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
var market = require('./operations/market_handler')
var ongame = require('./operations/ongame_handler')
var client = new Client('https://api.steemit.com')

app.listen(port, () => console.log(`Listening on ${port}`));

function WriteDonation(block, name, op, memo) {
    if(op.amount)
    {
        if (op.amount.split(' ')[1] === 'STEEM') {
            var xtr = new XMLHttpRequest();
            xtr.open('GET', 'https://api.coinmarketcap.com/v1/ticker/steem/', true);
            xtr.send();
            xtr.onreadystatechange = function () {
                if (xtr.readyState == 4) {
                    if (xtr.status == 200) {
                        if (xtr.responseText) {
                            try {
                                var ticker = JSON.parse(xtr.responseText)
                            }
                            catch (e) {
    
                            }
                            totalUSD = ticker[0].price_usd
                            console.log('Donator= ' + name + ' Amount= ' + totalUSD)
                            var amount = op.amount.split(' ')[0];
                            amount = Number(parseFloat(amount).toFixed(3)) * Number(parseFloat(totalUSD).toFixed(3))
                            var xkt = new XMLHttpRequest();
                            xkt.open('GET', 'https://ongameapi.herokuapp.com/api/adddonation/' + block + "/" + name + "/" + op.to + "/" + amount + "/" + memo + "/" + op.amount, true);
                            xkt.send();
                            xkt.onreadystatechange = function () {
                                if (xkt.readyState == 4) {
                                    if (xkt.status == 200) {
                                        if (xkt.responseText) {
                                            console.log(xkt.responseText)
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
                            try {
                                var ticker = JSON.parse(xtr.responseText)
                            }
                            catch (e) {
    
                            }
                            totalUSD = ticker[0].price_usd
                            console.log('Donator= ' + name + ' Amount= ' + totalUSD)
                            var amount = op.amount.split(' ')[0];
                            amount = Number(parseFloat(amount).toFixed(3)) * Number(parseFloat(totalUSD).toFixed(3))
                            var xpz = new XMLHttpRequest();
                            xpz.open('GET', 'https://ongameapi.herokuapp.com/api/adddonation/' + block + "/" + name + "/" + op.to + "/" + amount + "/" + memo + "/" + op.amount, true);
                            xpz.send();
                            xpz.onreadystatechange = function () {
                                if (xpz.readyState == 4) {
                                    if (xpz.status == 200) {
                                        if (xpz.responseText) {
                                            console.log(xpz.responseText)
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
   
}

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
            var transaction;
            if (object[i].operations[0][0] === "transfer" && object[i].operations[0][1].to === "ongame") {
                player.checkForPlayer(object[i].operations[0][1].from, function (exist) {
                    if (exist) {
                        shop.StartTransaction(transaction, function (error) {
                            if (error)
                                console.log(error)
                        })
                    }
                })
            }
            // if (object[i].operations[0][0] === "custom_json" && object[i].operations[0][1].id === "dw-fight") {
            //     try {
            //         var fight = JSON.parse(object[i].operations[0][1].json)
            //         battle.checkForABattle(fight.user_id, function (error) {
            //             if (error) {
            //                 console.log(error)
            //             }
            //         })

            //     } catch (error) {
            //         console.log(error)
            //     }
            // }
            // if (object[i].operations[0][0] === "custom_json" && object[i].operations[0][1].id === "dw-char") {
            //     try {
            //         var json = JSON.parse(object[i].operations[0][1].json)
            //         player.checkForPlayer(json.username, function (exist) {
            //             if (!exist) {
            //                 player.createNewPlayer(json.username, json.icon, function (error) {
            //                     if (error) {
            //                         console.log("couldnt create charachter")
            //                     }
            //                 })
            //             }
            //         })
            //     } catch (error) {
            //         console.log(error)
            //     }
            // }
            if (object[i].operations[0][1].id) {
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
                if (object[i].operations[0][0] === "custom_json" && object[i].operations[0][1].id === "ongame-sell") {
                    try {
                        console.log(object[i].operations[0][1])
                        var item = JSON.parse(object[i].operations[0][1].json)
                        item.seller = object[i].operations[0][1].required_posting_auths[0]
                        var today = new Date()
                        var dd = today.getUTCDate();
                        var mm = today.getUTCMonth() + 1; //January is 0!
                        var yyyy = today.getUTCFullYear();
                        var hhhh = today.getUTCHours()
                        var mmmm = today.getUTCMinutes()
                        var ssss = today.getUTCSeconds()
                        today = yyyy + '/' + mm + '/' + dd;
                        if (dd < 10) {
                            dd = '0' + dd
                        }
                        if (mm < 10) {
                            mm = '0' + mm
                        }
                        today = yyyy + '/' + mm + '/' + dd + ' ' + hhhh + ':' + mmmm + ':' + ssss;
                        item.date = today
                        market.insertItem(item, function (error) {
                            if (error)
                                console.log(error)
                        })

                    } catch (error) {
                        console.log(error)
                    }
                }
            }
            if (object[i].operations[0][0] === "comment") {
                var json = object[i].operations[0][1]
                try {
                    json.json_metadata = JSON.parse(json.json_metadata)
                }
                catch (e) {
                }
                if (json.json_metadata.tags) {
                    for (b = 0; json.json_metadata.tags.length > b; b++) {
                        if (json.json_metadata.tags[b]) {
                            if (json.json_metadata.tags[b].includes('fundition_') || json.json_metadata.tags[b].includes('fundition-') && json.parent_author === '') {
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
                                            console.log("Error: API not responding!");
                                        }
                                    }
                                }
                            }
                            if (json.json_metadata.tags[b].includes('myfundition') && json.parent_author === '') {
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
                                            console.log("Error: API not responding!");
                                        }
                                    }
                                }
                            }
                            if (json.json_metadata.tags[b].includes('ongame-') && json.parent_author === '') {
                                console.log('its an ongame content from ' + json.author)
                                var xtr = new XMLHttpRequest();
                                xtr.open('GET', 'https://ongameapi.herokuapp.com/api/addscore/' + json.author + "/xp/1", true);
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
                                ongame.insertItem(ongame.parseContent(json),function(error){
                                    if(error)
                                    console.log(error)
                                })
                                return
                            }
                        }
                    }
                }


            }
            if (object[i].operations[0][0] === "transfer") {
                var op = object[i].operations[0][1]
                var block = object[i].block_num
                if (op.memo.includes('Fundition-') || op.memo.includes('fundition-') || op.memo.includes('Project=Fundition-')) {
                    op.memo = op.memo.replace("/", "°")
                    if(op.memo)
                    {
                        var memo = op.memo.split(" ")
                        var newperm = memo[0].split("-")
                        var name = memo[1].split('=')[1]
                        if (op.from === "blocktrades") {
                            WriteDonation(block, name, op, memo)
                        }
                        if
                        (op.from === "fundition") {
                            WriteDonation(block, name, op, memo)
                        }
                        else {
                            WriteDonation(block, name, op, memo)
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



