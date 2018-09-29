const { Client, BlockchainMode } = require('dsteem');
const battle = require('./operations/battle_handler')
const player = require('./operations/player_handler')
var mysql = require('mysql');
const express = require('express')
var es = require('event-stream')
var util = require('util')
const fs = require('fs');
const app = express()
const port = process.env.PORT || 4000


app.listen(port, () => console.log(`Listening on ${port}`));


const client = new Client('https://api.steemit.com')

var stream = client.blockchain.getBlockStream({ mode: BlockchainMode.Irreversible })

var pool = mysql.createPool({
    connectionLimit: 5,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});

var maxpic = 5;

battle.CreateBattle()



checkForPlayer = function (player, cb) {
    console.log("check for player : " + player)
    pool.getConnection(function (err, connection) {
        var query = "SELECT * FROM user WHERE username = '" + player + "'"
        connection.query(query, function (err, result) {
            if (err) throw err;
            if (result[0] != undefined) {
                if (player = result[0].username) {
                    console.log("User : " + player + " is already recorded");
                    cb(true)
                }
            }
            else {
                console.log("User : " + player + " isnt recorded");
                cb(null)
            }
        });
    });
}


addXpToCharacter = function (character_id, xp, cb) {
    pool.getConnection(function (err, connection) {
        var query = "SELECT * FROM characters WHERE character_id = '" + character_id + "'"
        connection.query(query, function (err, result) {
            if (err) throw err;
            if (result[0] != undefined) {
                console.log(xp + "XP will be add to " + character_id)
                var character_new_xp = result[0].xp + xp
                var query = "UPDATE characters SET xp=" + character_new_xp + " WHERE  character_id=" + character_id;
                connection.query(query, function (err, result) {
                    if (err) throw err;
                    else {
                        console.log(xp + "XP added to character" + character_id)
                        connection.release();
                        cb(true)
                    }
                })
            }
            else {
                console.log("User : " + player + " isnt recorded");
                cb(null)
            }
        });
    });
}



StartTransaction = function (transaction, cb) {
    var username = transaction.from
    var amount = transaction.amount.split(' ')[0]
    var id;
    if (transaction.memo != undefined) {
        var item = transaction.memo.split('-')[1]
        console.log("Username : " + username + " Amount : " + amount + " Memo : " + item)

        pool.getConnection(function (err, connection) {
            var query = "SELECT * FROM user WHERE username='" + username + "'"
            connection.query(query, function (err, result) {
                // Always release the connection back to the pool after the (last) query.
                if (err) throw err;
                if (result[0] != undefined) {
                    id = result[0].user_id
                    var query = "SELECT * FROM shop WHERE item_id='" + item + "'"
                    connection.query(query, function (err, result) {
                        if (err) throw err;
                        else {
                            console.log("Item price = " + result[0].item_price + "Amount  = " + amount)
                            if (result[0].item_price <= amount) {
                                var item_ref = 0
                                item_ref = createUniqueId()
                                var query = createAndInserNewItem(result[0], item_ref)
                                connection.query(query, function (err, result) {
                                    if (err) throw err;
                                    else {
                                        console.log("Item Successfully Created")
                                        var query = "SELECT * FROM item WHERE item_ref='" + item_ref + "'"
                                        connection.query(query, function (err, result) {
                                            if (err) throw err;
                                            else {
                                                console.log("Item " + result[0].item_id + "with reference" + item_ref + " Successfully Added to " + id)
                                                var query = "INSERT INTO character_item (character_id, item_id) VALUES (" + id + "," + result[0].item_id + ")";
                                                connection.query(query, function (err, result) {
                                                    if (err) throw err;
                                                    else {
                                                        console.log("Item " + item_ref + " move to " + id)
                                                        addXpToCharacter(id, 10, function (result) {
                                                            if (result) {
                                                                connection.release();
                                                                cb(null)
                                                            }
                                                            else {
                                                                connection.release();
                                                                cb(true)
                                                            }

                                                        })

                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                            else {
                                console.log('not enough money')
                                connection.release();
                                cb(true)
                            }

                        }
                    })

                }
            });


        })
    }
    else {
        console.log("cannt read memo")
        console.log(transaction.memo)
    }

}
function createUniqueId() {
    var id = new Date().valueOf();
    console.log(id)
    return id
};

function createAndInserNewItem(shop_item, newitemid) {
    let rawdata = fs.readFileSync('prefix.json');
    let prefix = JSON.parse(rawdata);
    var item_quality = SetItemQuality()
    console.log(item_quality)
    var item_name;
    var requirel_level = shop_item.item_required_level
    var item_durability = shop_item.item_durability
    var damage = shop_item.item_damage
    var armor = shop_item.item_armor
    switch (item_quality) {
        case 1:
            prefix = prefix.weapon_quality_prefix.epic[Math.floor(Math.random() * prefix.weapon_quality_prefix.epic.length)]
            item_name = prefix +" " + shop_item.item_name
            requirel_level += 5
            item_durability = item_durability * 5
            break;
        case 2:
            prefix = prefix.weapon_quality_prefix.legendary[Math.floor(Math.random() * prefix.weapon_quality_prefix.legendary.length)]
            item_name = prefix +" " + shop_item.item_name
            requirel_level += 4
            item_durability = item_durability * 4
            break;
        case 3:
            prefix = prefix.weapon_quality_prefix.rare[Math.floor(Math.random() * prefix.weapon_quality_prefix.rare.length)]
            item_name = prefix +" " + shop_item.item_name
            requirel_level += 3
            item_durability = item_durability * 3
            break;
        case 4:
            prefix = prefix.weapon_quality_prefix.magic[Math.floor(Math.random() * prefix.weapon_quality_prefix.magic.length)]
            item_name = prefix +" " + shop_item.item_name
            requirel_level += 2
            item_durability = item_durability * 2
            break;
        default:
            prefix = prefix.weapon_quality_prefix.normal[Math.floor(Math.random() * prefix.weapon_quality_prefix.normal.length)]
            item_name = prefix +" " + shop_item.item_name
    }

    switch (shop_item.item_type_id) {
        case 1:
            damage = CreateWeapon(damage, item_quality)
            break;
        case 2:
            armor = CreateArmor(armor, item_quality)
            break;
        case 3:
            damage = CreateWeapon(damage, item_quality)
            armor = CreateArmor(armor, item_quality)
            break;
        case 4:
            break;
        default:
    }
    var query = "INSERT INTO item (item_ref, item_type_id, item_name, item_required_level, item_durability, item_quality, item_damage, item_armor) VALUES (" + newitemid + "," + shop_item.item_type_id + ",'" + item_name + "'," + requirel_level + "," + item_durability + "," + item_quality + ", " + damage + "," + armor + ")";
    return query
};

function SetItemQuality() {
    var rnd = 0
    rnd = getRandomInt(100)
    console.log("quality " + rnd)
    if (rnd > 99) {
        return 1
    }
    if (rnd > 95) {
        return 2
    }
    if (rnd > 87) {
        return 3
    }
    if (rnd > 71) {
        return 4
    }
    else {
        return 5
    }
}


function CreateWeapon(damage, item_quality) {
    return damage = damage * 7 / item_quality
}

function CreateArmor(armor, item_quality) {
    return armor = armor * 7 / item_quality
}

function CreateAccessories(damage, item_quality) {

}

function CreateAttribute(item_quality) {

}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function CreateAttributes(id) {
    var query = "";
    for (i = 1; i < 11; i++) {
        query += "(" + id + "," + [i] + "," + getRandomInt(12) + ")"
        query = query.replace(')(', '),(')
    }
    query = query.replace(')(', '),(')
    return query
}

var count = 0;
stream.on('data', function (block) {
    // try {
    //     console.log(block.transactions)
    // } catch (error) {
    //     console.log(error)
    // }
    if (block.transactions.op != undefined) {
        var object = JSON.stringify(block.transactions)
        object.replace('\\', '')
        object = JSON.parse(object)
        for (i = 0; i < object.length; i++) {
            var transaction;
           if (object[i].operations[0][0] === 'transfer' && object[i].operations[0][1].to === "ongame") {
                console.log('Transfer block for Ongame ' + block.block_id)
                transaction = object[i].operations[0][1]
                checkForPlayer(transaction.from, function (exist) {
                    if (exist) {
                        console.log('Transfer block ' + block.block_id)
                        StartTransaction(transaction, function (error) {
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
                                StartTransaction(transaction, function (error) {
                                    if (error)
                                        console.log(error)
                                })
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


