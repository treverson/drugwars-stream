var dsteem = require('dsteem')
var mysql = require('mysql');
const express = require('express')
var es = require('event-stream')
var util = require('util')

const app = express()
const port = process.env.PORT || 4000

app.listen(port, () => console.log(`Listening on ${port}`));

var client = new dsteem.Client('https://api.steemit.com')

var stream = client.blockchain.getBlockStream()

var pool = mysql.createPool({
    connectionLimit: 5,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});

function createNewPlayer(player, cb) {
    //INSERT USER
    var player_id;
    console.log("User : " + player + " will be recorded");
    var query = "INSERT INTO user (username, user_type_id) VALUES ('" + player + "','1')";
    connection.query(query, function (err, result) {
        if (err) throw err;
        else {
            console.log("User : " + player + " is now recorded in db")
            //RECUPERATE USER ID
            var query = "SELECT * FROM user WHERE username='" + player + "'"
            connection.query(query, function (err, result) {
                if (err) throw err;
                if (result[0] != undefined) {
                    player_id = result[0].user_id
                    console.log("User : " + player + " will get his character and will have this id now : " + player_id);
                    //INSERT USER CHARACTER
                    var query = "INSERT INTO characters (character_id, character_type_id, name, alive, level, xp, money) VALUES (" + player_id + ",1,'" + player + "',1,1,1,100)"
                    connection.query(query, function (err, result) {
                        if (err) throw err;
                        else {
                            console.log("User : " + player + " have now starting values and will now get his attributes")
                            //INSERT USER ATTRIBUTES
                            var query = "INSERT INTO character_attribute (character_id, attribute_id, value) VALUES " + CreateAttributes(player_id);
                            connection.query(query, function (err, result) {
                                if (err) throw err;
                                else {
                                    console.log("User : " + player + " is now ready to play")
                                    connection.release();
                                    cb(null)
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

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

StartTransaction = function (transaction, cb) {
    console.log("transaction = " + transaction)
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
                            if (result[0].price <= amount) {
                                var query = createAndInserNewItem(result[0])
                                connection.query(query, function (err, result) {
                                    if (err) throw err;
                                    else {
                                        console.log("Item Successfully Added for " + username)
                                        connection.release();
                                        cb(null)
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

function createAndInserNewItem(shop_item) {
    var item_quality = SetItemQuality()
    var item_name;
    var requirel_level = shop_item.item_required_level
    var item_durability = shop_item.item_durability
    var damage = shop_item.item_damage
    var armor = shop_item.item_armor
    switch (item_quality) {
        case 1:
            item_name = "Epic " + shop_item.name
            requirel_level+= 5
            item_durability = item_durability * 5
            break;
        case 2:
            item_name = "Legenday " + shop_item.name
            requirel_level+= 4
            item_durability = item_durability * 4
            break;
        case 3:
            item_name = "Rare " + shop_item.name
            requirel_level+= 3
            item_durability = item_durability * 3
            break;
        case 4:
            item_name = "Magical " + shop_item.name
            requirel_level+= 2
            item_durability = item_durability * 2
            break;
        default:
            item_name = "Simple " + shop_item.name
    }

    switch (shop_item.item_type_id) {
        case 1:
            damage = CreateWeapon(damage, item_quality)
            break;
        case 2:
            armor = CreateArmor(armor,item_quality)
            break;
        case 3:
            damage = CreateWeapon(damage, item_quality)
            armor = CreateArmor(armor,item_quality)
            break;
        case 4:
            break;
        default:
    }

    var query = "INSERT INTO item (item_type_id, item_name, item_required_level, item_durability, item_quality, item_damage, item_armor) VALUES (" + shop_item.item_type_id + ",'" + item_name + "'," + item + "," + requirel_level + "," + item_durability + "," + item_quality + ", " + damage +","+ armor +")";
    return query
};

function SetItemQuality() {
    var rnd = getRandomInt(max)
    if (rnd = 100) {
        item_quality = 1
    }
    if (rnd > 95) {
        item_quality = 2
    }
    if (rnd > 87) {
        item_quality = 3
    }
    if (rnd > 71) {
        item_quality = 4
    }
    else {
        item_quality = 5
    }
    return item_quality
}


function CreateWeapon(damage, item_quality) {
    return damage = damage * 7/ item_quality
}

function CreateArmor(armor, item_quality) {
    return armor = armor * 7/ item_quality
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


stream.on('data', function (block) {
    if (block.transactions[0] != undefined) {
        var object = JSON.stringify(block.transactions)
        object.replace('\\', '')
        object = JSON.parse(object)
        for (i = 0; i < object.length; i++) {
            var transaction;
            if (object[i].operations[0][0] === 'transfer' && object[i].operations[0][1].to === "ongame") {
                console.log(object[i].operations[0][1])
                console.log('Transfer block ' + block.block_id)
                transaction = object[i].operations[0][1]

                checkForPlayer(transaction.from, function (exist) {
                    if (exist) {
                        console.log('Transfer block ' + block.block_id)
                        console.log(transaction)
                        StartTransaction(transaction, function (error) {
                            if (error)
                                console.log(error)
                        })
                    }
                    else {
                        console.log("New player creation")
                        createNewPlayer(transaction, function (error) {
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