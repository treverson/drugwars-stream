var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 5,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});
var maxpic = 5;
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

CreateAttributes= function (id) {
    var query = "";
    for (i = 1; i < 11; i++) {
        query += "(" + id + "," + [i] + "," + getRandomInt(12) + ")"
        query = query.replace(')(', '),(')
    }
    query = query.replace(')(', '),(')
    return query
}

createUniqueId=function () {
    var id = new Date().valueOf();
    return id
}


const player_handler = {
    createNewPlayer : function (player, cb) {
        //INSERT USER 
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
    },
    checkForPlayer : function (player, cb) {
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
    },
    addXpToCharacter : function (character_id, xp, cb) {
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
}
module.exports = player_handler;