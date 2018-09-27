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
            var operation = object[i].operations
            if (operation[0][0] === 'transfer') {
                var transaction = operation[0][1]
                if (transaction.to === "ongame") {
                    console.log('Ongame Transaction For a Character')
                    console.log('With the block ' + block.block_id)
                    var player = transaction.from
                    checkForPlayer(player, function (ifExist) {
                        if (ifExist) {
                            StartTransaction(transaction)
                        }
                        else {
                            createNewPlayer(player, function (ifExist) {
                                if (ifExist) {
                                    StartTransaction(transaction)
                                }
                            })
                        }
                    })
                }
            }
            else {
                var operation = object[i].operations
                if (operation[0][0] === 'comment') {
                    console.log('block ' + block.block_id)
                    var transaction = operation[0][1]
                    var post = transaction
                    if (post.parent_permlink === "ongame-battle") {
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
                    cb(true)
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
                                        cb(true)
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
StartTransaction= function (transaction){
    console.log(transaction)
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
