const express = require('express');
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 5,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});

function StartNewBattle(player_id, cb) {
    pool.getConnection(function (err, connection) {
        var query = "INSERT INTO battle (battle_player_one_id, battle_time) VALUES (" + player_id + "," + Date.now().toLocaleString()+ ")"
        connection.query(query, function (err, result) {
            if (err) console.log(error);
            else {
                console.log("User : " + player_id + " Started a new battle")
                connection.release();
            }
        })
    })
}

function JoinBattle(player_id,battle_id, cb) {
    pool.getConnection(function (err, connection) {
        var query = "INSERT INTO battle (battle_player_one_id, battle_time) VALUES (" + player_id + "," + Date.now().toLocaleString()+ ")"
        connection.query(query, function (err, result) {
            if (err) console.log(error);
            else {
                console.log("User : " + player_id + " Started a new battle")
                connection.release();
            }
        })
    })
}

const battle_handler = {
    checkForABattle: function (player_id,battle_id, cb) {
        if(battle_id > 0){
            JoinBattle(player_id,battle_id,function(error){
                if(error)
                console.log(error)
            })
        }
        //INSERT USER 
        pool.getConnection(function (err, connection) {
            var query = "SELECT * FROM user WHERE user_id='" + player_id + "'"
            connection.query(query, function (err, result) {
                if (err) console.log(error);
                else {
                    var query = "SELECT * FROM battle"
                    connection.query(query, function (err, result) {
                        if (err) console.log(error);
                        else {
                            if (result.length > 0) {
                                console.log(result)
                                for (i=0; result.length > i; i++)
                                {
                                    console.log(result[i])
                                }
                            }
                            else {
                                console.log('There is no battle')
                                StartNewBattle(player_id,function(error)
                                {
                                    if(error)
                                    console.log(error)
                                })
                            }
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