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
        var query = "INSERT INTO battle (battle_player_one_id) VALUES (" + player_id +")"
        connection.query(query, function (err, result) {
            if (err) console.log(err);
            else {
                console.log("User : " + player_id + " Started a new battle")
                connection.release();
                cb(null)
            }
        })
    })
}

function JoinBattle(player_id,battle_id, cb) {
    pool.getConnection(function (err, connection) {
        var query = "INSERT INTO battle (battle_player_one_id, battle_time) VALUES (" + player_id + "," + new Date().toJSON().slice(0, 19).replace('T', ' ')+ ")"
        connection.query(query, function (err, result) {
            if (err) console.log(error);
            else {
                console.log("User : " + player_id + " Started a new battle")
                connection.release();
            }
        })
    })
}


function checkFreeBattle(player_id,battles) {
    for (i=0; battles.length > i; i++)
    {
        console.log(battles[i])
        if(battles[i].battle_player_one_id != player_id)
        return battles[i]
    }
    return false
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
                                if(checkFreeBattle(player_id,result))
                                {
                                    var battle_to_join = checkFreeBattle(player_id,result)
                                    console.log(battle_to_join)
                                }
                                else{
                                    console.log('There is no available battle')
                                    StartNewBattle(player_id,function(error)
                                    {
                                        if(error)
                                        console.log(error)
                                    })
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