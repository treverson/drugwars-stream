var db = require('../lib/db');

const player_handler = {
    checkIfExist: function (username, cb) {
        let query = "SELECT * FROM users WHERE username = ?";
        db.query(query, [username], function (err, result) {
            if (err || !result || !result[0]) {
                console.log(username + ' doesnt exist')
                return cb(null);
            }
            else cb(true)
        });
    },
    createNew: function (player, icon, referrer, cb) {
        var now = new Date().toISOString().slice(0, 19).replace('T', ' ')
        let query = `INSERT INTO users (username, drugs_balance, drug_production_rate, weapons_balance, weapon_production_rate, last_update, xp, picture, referrer ) VALUES ('${player}', 1000, 0.20, 1000, 0.20,'${now}', 1, ${icon},'${referrer}'); \n\
                     INSERT INTO users_buildings (username,building,next_update,lvl) VALUES ('${player}','headquarters','${now}',1); \n\
                     INSERT INTO users_buildings (username,building,next_update,lvl) VALUES ('${player}','crackhouse','${now}',1); \n\
                     INSERT INTO users_buildings (username,building,next_update,lvl) VALUES ('${player}','ammunition','${now}',1); \n\
                     `
        db.query(query, function (err, result) {
            if (err || !result || !result[0]) {
                console.log('coudlnt create a character for username ' + player + err)
                return cb(true);
            }
            else {
                console.log("User : " + player + " is now ready to play")
                cb(null)
            }

        });
    },
    addXp: function (name, xp, cb) {
        console.log(name)
        var query = "UPDATE users SET xp= xp+" + xp + " WHERE username='" + name + "'"
        db.query(query, function (err, result) {
            if (err) {
                console.log('coudlnt add xp for ' + name)
                return cb(true);
            }
            else {
                console.log(xp + "XP added to character" + name)
                cb(true)
            }
        })
    },
    getUpdateCharacter: function (username, cb) {
        let query = "SELECT * FROM users WHERE username = ?";
        db.query(query, [username], function (err, result) {
            if (err || !result || !result[0] || result[0] === null) {
                console.log(err);
                cb(null)
            }
            else {
                const user = result[0]
                query = "SELECT * FROM users_buildings WHERE username = ?";
                  db.query(query,[user.username],
                      function (err, result) {
                          if (err) {
                              console.log(err);
                              cb(null);
                          } else {
                              const buildings = JSON.parse(JSON.stringify(result))
                              var now = new Date()
                              var nowtomysql = new Date().toISOString().slice(0, 19).replace('T', ' ')
                              var differenceprod = now.getTime() - user.last_update.getTime()
                              var drugs_balance = user.drugs_balance + Number(parseFloat((differenceprod / 1000) * user.drug_production_rate).toFixed(2))
                              var weapons_balance = user.weapons_balance + Number(parseFloat((differenceprod / 1000) * user.weapon_production_rate).toFixed(0))
                              if(buildings.filter(function (item) { return item.building === "operation_center"})[0])
                              {
                                var operation_center = buildings.filter(function (item) { return item.building === "operation_center"})[0]
                                drugs_balance = drugs_balance + (drugs_balance*(operation_center.lvl*(0.005)))
                                weapons_balance = weapons_balance + (weapons_balance*(operation_center.lvl*(0.005)))
                                console.log('applied bonus %' + (operation_center.lvl*(0.005)))
                              }
                              var query = `UPDATE users SET drugs_balance=${drugs_balance}, weapons_balance=${weapons_balance}, last_update='${nowtomysql}' WHERE username='${username}'`
                              db.query(query, function (err, result) {
                                  if (err) throw err;
                                  else {
                                      user.drugs = drugs_balance
                                      user.weapons = weapons_balance
                                      console.log("user - Updated user " + user.username + ' new drug balance : ' + drugs_balance + 'new weapon balance : ' + weapons_balance)
                                      cb(user)
                                  }
                              })
                          }
                      }
                  );

               
            }
        });
    },
    getCharacter: function (username, cb) {
        let query = "SELECT * FROM users WHERE username = ?";
        db.query(query, [username], function (err, result) {
            if (err || !result || !result[0])
                return cb(null);
            const character = result[0];
            query = "SELECT * FROM users_buildings WHERE username = ?; \n\
          SELECT * FROM heist WHERE username = ?";
            db.query(
                query,
                [character.username, character.username],
                function (err, result) {
                    if (err) {
                        console.log(err);
                        cb(null);
                    } else {
                        const [[buildings], [heist]] = result;
                        cb({ character, buildings, heist });
                    }
                }
            );
        });
    },
    removeDrugs: function (username, amount, cb) {
        var query = "UPDATE users SET drugs_balance=drugs_balance-" + amount + " WHERE username='" + username + "'"
        db.query(query, function (err, result) {
            if (err) {
                console.log(err)
                cb(null)
            }
            else {
                console.log("Upgraded balance : for : " + username)
                cb(true)
            }
        })
    },
    checkArmy: function (username, army, cb) {
        let query = "SELECT * FROM users_units WHERE username = ?";
        db.query(query, [username], function (err, result) {
            if (err || !result || !result[0]) {
                console.log(username + ' doesnt exist')
                return cb(null);
            }
            console.log(result)
            for(i=0;i<army.length;i++)
            {    
                console.log('1bra ' + result[0].filter(function (item) { return item.unit === army[i].unit}))
                console.log(result.filter(function (item) { return item.unit === army[i].unit}))
                if(result.filter(function (item) { return item.unit === army[i].unit})[0])
                {
                    console.log(result.filter(function (item) { return item.building === "operation_center"})[0])
                }
            }

            cb(true)
        })
    }
}
module.exports = player_handler;