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

CreateAttributes = function (id) {
    var query = "";
    for (i = 1; i < 11; i++) {
        query += "(" + id + "," + [i] + "," + getRandomInt(12) + ")"
        query = query.replace(')(', '),(')
    }
    query = query.replace(')(', '),(')
    return query
}

createUniqueId = function () {
    var id = new Date().valueOf();
    return id
}


const player_handler = {
    createNewPlayer: function (player, icon, cb) {
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
                        if (err) console.log(err);
                        if (result[0] != undefined) {
                            player_id = result[0].user_id
                            console.log("User : " + player + " will get his character and will have this id now : " + player_id);
                            //INSERT USER CHARACTER
                            var query = "INSERT INTO `character` (character_id, character_type_id, name, alive, level, xp, money, picture, drugs, weapon_production_rate, last_update, drug_production_rate, weapons,rewards ) VALUES ('" + player_id + "', 1,'" + player + "', 1, 1, 1, 100,'" + icon + "', 1000, 0.10,'" + new Date().toISOString().slice(0, 19).replace('T', ' ') + "',0.10,1000,0)"
                            connection.query(query, function (err, result) {
                                if (err) console.log(err);
                                else {
                                    console.log("User : " + player + " have now starting values and will now get his attributes")
                                    //INSERT USER ATTRIBUTES
                                    var query = "INSERT INTO character_attribute (character_id, attribute_id, value) VALUES " + CreateAttributes(player_id);
                                    connection.query(query, function (err, result) {
                                        if (err) console.log(err);
                                        else {
                                            console.log("User : " + player + " is now ready to play")
                                            //INSERT USER BUILDINGS
                                            var query = "INSERT INTO character_buildings (character_id) VALUES (" + player_id + ")"
                                            connection.query(query, function (err, result) {
                                                if (err) console.log(err);
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
            })
        })
    },
    getPlayerId: function (player, cb) {
        pool.getConnection(function (err, connection) {
            var query = "SELECT * FROM user WHERE username = '" + player + "'"
            connection.query(query, function (err, result) {
                if (err) throw console.log(err);
                if (result[0] != undefined) {
                    if (player = result[0].username) {
                        cb(result[0].user_id)
                    }
                }
                else {
                    console.log("User : " + player + " isnt recorded");
                    cb(null)
                }
            });
        });
    },
    addXpToCharacter: function (character_id, xp, cb) {
        pool.getConnection(function (err, connection) {
            var query = "SELECT * FROM character WHERE character_id = '" + character_id + "'"
            connection.query(query, function (err, result) {
                if (err) throw err;
                if (result[0] != undefined) {
                    console.log(xp + "XP will be add to " + character_id)
                    var character_new_xp = result[0].xp + xp
                    var query = "UPDATE character SET xp=" + character_new_xp + " WHERE  character_id=" + character_id;
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
    },
    addLevelToPlayerBuilding: function (character_id, building_id, cb) {
        pool.getConnection(function (err, connection) {
            var now = new Date().toISOString().slice(0, 19).replace('T', ' ')
            var query = `UPDATE character_buildings SET building_${building_id}_level=+1, building_${building_id}_last_update='${now}'  WHERE character_id=${character_id}`
            connection.query(query, function (err, result) {
                if (err) cb(err);
                else {
                    console.log("Upgraded character building :" + building_id + " for : " + character_id)
                    connection.release();
                    cb(null)
                }
            })
        })
    },
    updateGetPlayer: function (character_id, cb) {
        pool.getConnection(function (err, connection) {
            var query = "SELECT * FROM `character` WHERE character_id=" + character_id
            connection.query(query, function (err, result) {
                if (err) console.log(err);
                if (result) {
                    player = result[0]
                    var now = new Date()
                    var nowtomysql = new Date().toISOString().slice(0, 19).replace('T', ' ')
                    var differenceprod = now.getTime() - player.last_update.getTime()
                    var drug_balance = player.drugs + Number(parseFloat((differenceprod / 1000) * player.drug_production_rate).toFixed(2))
                    var weapon_balance = player.weapons + Number(parseFloat((differenceprod / 1000) * player.weapon_production_rate).toFixed(0))
                    var query = `UPDATE \`character\` SET drugs=${drug_balance}, weapons=${weapon_balance}, last_update='${nowtomysql}' WHERE  character_id=${character_id}`
                    connection.query(query, function (err, result) {
                        if (err) throw err;
                        else {
                            player.drugs = drug_balance
                            player.weapons = weapon_balance
                            connection.release();
                            console.log("Player - Updated character " + player.name + ' new drug balance : ' + drug_balance + 'new weapon balance : ' + weapon_balance)
                            cb(player)
                        }
                    })
                }
            });
        });
    },
    updateProductionRate: function (character_id, type, rate, cb) {
        pool.getConnection(function (err, connection) {
            var query = `UPDATE \`character\` SET ${type}=+${rate} WHERE  character_id=${character_id}`
            connection.query(query, function (err, result) {
                if (err) throw err;
                else {
                    console.log("Updated character " + player + 'production rate')
                    connection.release();
                    cb(true)
                }
            })
        });
    },
    removeDrugs: function (character_id, building_id, cb) {
        pool.getConnection(function (err, connection) {
            var query = "SELECT * FROM `character` WHERE character_id = '" + character_id + "'"
            connection.query(query, function (err, result) {
                if (err) throw err;
                if (result[0] != undefined) {
                    console.log(xp + "XP will be add to " + character_id)
                    var character_new_xp = result[0].xp + xp
                    var query = "UPDATE character SET xp=" + character_new_xp + " WHERE  character_id=" + character_id;
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