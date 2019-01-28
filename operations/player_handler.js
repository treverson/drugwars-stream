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
    checkPlayer: function (player, cb) {
        pool.getConnection(function (err, connection) {
            var query = "SELECT * FROM `character` WHERE name = '" + player + "'"
            connection.query(query, function (err, result) {
                if (err) throw console.log(err);
                if (result[0] != undefined) {
                        cb(result[0].user_id)
                }
                else {
                    console.log("User : " + player + " isnt recorded");
                    cb(null)
                }
            });
        });
    },
    createNewPlayer: function (player, icon, referrer, cb) {
        //INSERT USER 
        pool.getConnection(function (err, connection) {
            console.log("User : " + player + " will get his character and will have this id now : ");
            //INSERT USER CHARACTER
            var query = "INSERT INTO `character` (character_type_id, name, alive, level, xp, money, picture, drugs, weapon_production_rate, last_update, drug_production_rate, weapons,rewards, referrer ) VALUES (1,'" + player + "', 1, 1, 1, 100,'" + icon + "', 1000, 0.10,'" + new Date().toISOString().slice(0, 19).replace('T', ' ') + "',0.10,1000,0,'" + referrer + "')"
            connection.query(query, function (err, result) {
                if (err) console.log(err);
                else {
                    console.log("User : " + player + " have now starting values and will now get his attributes")
                    //INSERT USER BUILDINGS
                    var query = "INSERT INTO character_buildings (name) VALUES ('" + player + "')"
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

        })
    },
    addXpToCharacter: function (name, xp, cb) {
        pool.getConnection(function (err, connection) {
            var query = "SELECT * FROM character WHERE name = '" + name + "'"
            connection.query(query, function (err, result) {
                if (err) throw err;
                if (result[0] != undefined) {
                    console.log(xp + "XP will be add to " + name)
                    var character_new_xp = result[0].xp + xp
                    var query = "UPDATE character SET xp=" + character_new_xp + " WHERE  name='" + name+ "'"
                    connection.query(query, function (err, result) {
                        if (err) throw err;
                        else {
                            console.log(xp + "XP added to character" + name)
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
    updateGetPlayer: function (name, cb) {
        pool.getConnection(function (err, connection) {
            var query = "SELECT * FROM `character` WHERE name ='" + name +"'"
            connection.query(query, function (err, result) {
                if (err) console.log(err);
                if (result) {
                    player = result[0]
                    var now = new Date()
                    var nowtomysql = new Date().toISOString().slice(0, 19).replace('T', ' ')
                    var differenceprod = now.getTime() - player.last_update.getTime()
                    var drug_balance = player.drugs + Number(parseFloat((differenceprod / 1000) * player.drug_production_rate).toFixed(2))
                    var weapon_balance = player.weapons + Number(parseFloat((differenceprod / 1000) * player.weapon_production_rate).toFixed(0))
                    var query = `UPDATE \`character\` SET drugs=${drug_balance}, weapons=${weapon_balance}, last_update='${nowtomysql}' WHERE  name='${name}'`
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
    updateProductionRate: function (name, type, rate, cb) {
        pool.getConnection(function (err, connection) {
            var query = `UPDATE \`character\` SET ${type}=+${rate} WHERE  name='${name}'`
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
    removeDrugs: function (name, building_id, cb) {
        pool.getConnection(function (err, connection) {
            var query = "SELECT * FROM `character` WHERE name = '" + name + "'"
            connection.query(query, function (err, result) {
                if (err) throw err;
                if (result[0] != undefined) {
                    console.log(xp + "XP will be add to " + name)
                    var character_new_xp = result[0].xp + xp
                    var query = "UPDATE character SET xp=" + character_new_xp + " WHERE  name='" + name+ "'"
                    connection.query(query, function (err, result) {
                        if (err) throw err;
                        else {
                            console.log(xp + "XP added to character" + name)
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