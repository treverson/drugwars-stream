const express = require('express');
var mysql = require('mysql');

const player_handler={}

player_handler.CreateBattle = function() {
    console.log('Battle Created !');
}

player_handler.StartBattle = function() {
    console.log('Battle Started !');
}

var pool = mysql.createPool({
    connectionLimit: 5,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});


player_handler.createNewPlayer = function (transaction, cb) {
    //INSERT USER 
    var player = transaction.from
    var player_id;
    console.log("User : " + player + " will be recorded");
    pool.getConnection(function (err, connection) {
        var query = "INSERT INTO user (username, user_type_id) VALUES ('" + player + "','1')";
        connection.query(query, function (err, result) {
            if (err) console.log(error);
            else {
                console.log("User : " + player + " is now recorded in db")
                //RECUPERATE USER ID
                var query = "SELECT * FROM user WHERE username='" + player + "'"
                connection.query(query, function (err, result) {
                    if (err) console.log(error);
                    if (result[0] != undefined) {
                        player_id = result[0].user_id
                        console.log("User : " + player + " will get his character and will have this id now : " + player_id);
                        //INSERT USER CHARACTER
                        var query = "INSERT INTO characters (character_id, character_type_id, name, alive, level, xp, money, picture) VALUES (" + player_id + ",1,'" + player + "',1,1,1,100," + getRandomInt(maxpic) + ")"
                        connection.query(query, function (err, result) {
                            if (err) console.log(error);
                            else {
                                console.log("User : " + player + " have now starting values and will now get his attributes")
                                //INSERT USER ATTRIBUTES
                                var query = "INSERT INTO character_attribute (character_id, attribute_id, value) VALUES " + CreateAttributes(player_id);
                                connection.query(query, function (err, result) {
                                    if (err) console.log(error);
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
    })
}

module.exports = player_handler;