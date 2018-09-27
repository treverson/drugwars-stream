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
                console.log('block ' + block.block_id)
                var transaction = operation[0][1]
                if (transaction.to === "ongame") {
                    console.log('Ongame Transaction For a Character')
                    console.log(transaction.from)
                    Connect(transaction.from, "", "")
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

        // if(object[0].operations)
        // {
        //     var type = object[0].operations[0][0]
        //     if(type === 'transfer')
        //     {
        //         console.log('transfer')
        //         console.log(object[0].operations[0][0])
        //     }

        //     if(object[1].operations[0][0])
        //     {
        //         var type2 = object[1].operations[0][0]
        //         if(type2 === 'transfer')
        //         {
        //             console.log('transfer2')
        //             console.log(object[1].operations[0][0])
        //         }
        //     }

        // }

    }
})
    .on('end', function () {
        // done
        console.log('END');
    });


// OpenConnection = function () {
//     var con = mysql.createConnection({
//         host: process.env.MYSQL_HOST,
//         user: process.env.MYSQL_USERNAME,
//         password: process.env.MYSQL_PASSWORD,
//         database: MYSQL_DB
//     });
// }

var pool = mysql.createPool({
    connectionLimit: 5,
    host: "us-cdbr-iron-east-01.cleardb.net",
    user: "bce50ec26bedce",
    password: "13c7ceb6",
    database: "heroku_38540d920d933f3"
});

Connect = function (user, transaction, action) {
    pool.getConnection(function (err, connection) {
        var query = "SELECT * FROM user WHERE username='" + user + "'"
        connection.query(query, function (err, result) {
            // Always release the connection back to the pool after the (last) query.
            if (err) throw err;
            if (result[0] != undefined) {
                if (user = result[0].username) {
                    console.log("User : " + user + " is already recorded");
                    connection.release();
                }
            }

            else {
                //INSERT USER
                console.log("User : " + user + " will be recorded");
                var userid;
                var query = "INSERT INTO user (username, user_type_id) VALUES ('" + user + "','1')";
                connection.query(query, function (err, result) {
                    if (err) throw err;
                    else {
                        console.log("User : " + user + " is now recorded in db")

                        //RECUPERATE USER ID
                        var query = "SELECT * FROM user WHERE username='" + user + "'"
                        connection.query(query, function (err, result) {
                            // Always release the connection back to the pool after the (last) query.
                            if (err) throw err;
                            if (result[0] != undefined) {
                                user_id = result[0].user_id
                                console.log("User : " + user + " will have this id now : " + user_id);
                                //INSERT USER CHARACTER
                                console.log("User : " + user + " will get his character");
                                var query = "INSERT INTO characters (character_id, character_type_id, name, alive, level, xp, money) VALUES (" + user_id + ",1,'" + user + "',1,1,1,100)" 
                                connection.query(query, function (err, result) {
                                    if (err) throw err;
                                    else {
                                        console.log("User : " + user + " have now starting values")
                                        //INSERT USER ATTRIBUTES
                                        console.log("User : " + user + " will now get his attributes");

                                        var query = "INSERT INTO character_attribute (character_id, attribute_id, value) VALUES " + CreateAttributes(user_id);
                                        connection.query(query, function (err, result) {
                                            if (err) throw err;
                                            else {
                                                console.log("User : " + user + " have now starting values")
                                                connection.release();
                                            }
                                        })
                                    }
                                })
                            }
                        })


                    }
                })
            }
            // Don't use the connection here, it has been returned to the pool.
        });
    });
}


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function CreateAttributes(id) {
    var query = "";
    for (i = 1; i < 11; i++) {
        query += "(" + id + "," + [i] + "," + getRandomInt(12) + ")"
        query = query.replace(')(','),(')
    }
    query = query.replace(')(','),(')
    return query
}

mysqlQuery = function (query, cb) {
    connection.connect();
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        else {
            return cb(results)
        }
    });
}


function getHash(input) {
    var hash = 0, len = input.length;
    for (var i = 0; i < len; i++) {
        hash = ((hash << 5) - hash) + input.charCodeAt(i);
        hash |= 0; // to 32bit integer
    }
    return hash;
}


