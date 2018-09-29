const express = require('express');
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 5,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});

const battle_handler={
    createBattle : function (player_id, cb) {
        //INSERT USER 
        pool.getConnection(function (err, connection) {
            var query = "SELECT * FROM user WHERE username='" + player + "'"
            connection.query(query, function (err, result) {
                if (err) console.log(error);
                else {
                    console.log(result)
                    var query = "SELECT * FROM battle"
                    connection.query(query, function (err, result) {
                        if (err) console.log(error);
                        else {
                            console.log(result)
                        }
                    })
                }
            })
        })
    }
}


module.exports = battle_handler;

// var query = "INSERT INTO character_attribute (character_id, attribute_id, value) VALUES " + helpers.CreateAttributes(player_id);
// connection.query(query, function (err, result) {
//     if (err) console.log(error);
//     else {
//         console.log("User : " + player + " is now ready to play")
//         connection.release();
//         cb(null)
//     }
// })