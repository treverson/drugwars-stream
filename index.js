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




stream.on('data', function (block) {
    if (block.transactions[0] != undefined) {
        var object = JSON.stringify(block.transactions)
        object.replace('\\', '')
        object = JSON.parse(object)
        for (i = 0; i < object.length; i++) {
            if (object[i].operations[0][0] === 'transfer') {
                var transaction = object[i].operations[0][1]
                if (transaction.to === "ongame") {
                    console.log('Transfer block ' + block.block_id)
                    var player = transaction.from
                    checkForPlayer(player, function (error) {
                        if (error) {
                            createNewPlayer(player, function (error) {
                                if (!error) {
                                    StartTransaction(transaction, function (error) {
                                        if (error)
                                            console.log(error)
                                    })
                                }
                            })
                        }
                        else {
                            StartTransaction(transaction, function (error) {
                                if (error)
                                    console.log(error)
                            })
                        }
                    })
                }
            }
            else {
                var operation = object[i].operations
                if (operation[0][0] === 'comment') {
                    console.log('Comment block ' + block.block_id)
                    var transaction = operation[0][1]
                    var post = transaction
                    if (post.parent_permlink === "life") {
                        console.log('new fight' + post.json_metadata.fightnumber)
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

var pool = mysql.createPool({
    connectionLimit: 5,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});


checkForPlayer = function (player, cb) {
    pool.getConnection(function (err, connection) {
        var query = "SELECT * FROM user WHERE username='" + player + "'"
        connection.query(query, function (err, result) {
            // Always release the connection back to the pool after the (last) query.
            if (err) throw err;
            if (result[0] != undefined) {
                if (player = result[0].username) {
                    console.log("User : " + player + " is already recorded");
                    connection.release();
                    cb(null)
                }
            }
        });
    });
}

createNewPlayer = function (user, cb) {
    pool.getConnection(function (err, connection) {
        //INSERT USER
        console.log("User : " + player + " will be recorded");
        var player_id;
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
                        player_id = result[0].player_id
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
                    var query = "SELECT * FROM item WHERE item_id='" + item + "'"
                    connection.query(query, function (err, result) {
                        if (err) throw err;
                        else {
                            console.log("Item price = " + result[0].price + "Amount  = " + amount)
                            if (result[0].price <= amount) {
                                var query = "INSERT INTO character_item (character_id, item_id) VALUES (" + id + "," + item + ")";
                                connection.query(query, function (err, result) {
                                    if (err) throw err;
                                    else {
                                        console.log("Item Added for " + username)
                                        cb(null)
                                        connection.release();
                                    }
                                })
                            }
                            else {
                                cb(true)
                                console.log('not enough money')
                            }

                        }
                    })

                }
            });


        })
    }

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
