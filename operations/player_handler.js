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
        let query = `INSERT INTO users (username, xp, picture, drugs, drug_production_rate, weapons, weapon_production_rate, last_update, referrer ) VALUES ('${player}', 1,${icon}, 1000, 0.10,1000,0.10,'${now}','${referrer}'); \n\
                     INSERT INTO buildings (username,name,next_update,level) VALUES ('${player}','headquarters','${now}',1); \n\
                     INSERT INTO buildings (username,name,next_update,level) VALUES ('${player}','crackhouse','${now}',1); \n\
                     INSERT INTO buildings (username,name,next_update,level) VALUES ('${player}','ammunition','${now}',1); \n\
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
                const character = result[0]
                query = "SELECT * FROM buildings WHERE username = ?";
                  db.query(query,[character.name],
                      function (err, result) {
                          if (err) {
                              console.log(err);
                              cb(null);
                          } else {
                              const buildings = result[0]
                              var now = new Date()
                              var nowtomysql = new Date().toISOString().slice(0, 19).replace('T', ' ')
                              var differenceprod = now.getTime() - character.last_update.getTime()
                              var drug_balance = character.drugs + Number(parseFloat((differenceprod / 1000) * character.drug_production_rate).toFixed(2))
                              var weapon_balance = character.weapons + Number(parseFloat((differenceprod / 1000) * character.weapon_production_rate).toFixed(0))
                              if(buildings.building_4_level > 0)
                              {
                                drug_balance = drug_balance + (drug_balance*(buildings.building_4_level*(0.005)))
                                weapon_balance = weapon_balance + (weapon_balance*(buildings.building_4_level*(0.005)))
                                console.log('applied bonus %' + (buildings.building_4_level*(0.005)))
                              }
                              var query = `UPDATE \`character\` SET drugs=${drug_balance}, weapons=${weapon_balance}, last_update='${nowtomysql}' WHERE  username='${username}'`
                              db.query(query, function (err, result) {
                                  if (err) throw err;
                                  else {
                                      character.drugs = drug_balance
                                      character.weapons = weapon_balance
                                      console.log("character - Updated character " + character.name + ' new drug balance : ' + drug_balance + 'new weapon balance : ' + weapon_balance)
                                      cb(character)
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
            query = "SELECT * FROM character_buildings WHERE username = ?; \n\
          SELECT * FROM heist_pool WHERE username = ?";
            db.query(
                query,
                [character.name, character.name],
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
    updateProductionRate: function (name, type, rate, cb) {
        var query = `UPDATE users SET ${type}=+${rate} WHERE  username='${name}'`
        db.query(query, function (err, result) {
            if (err) {
                console.log(err)
                cb(null)
            }
            else {
                console.log("Updated character " + player + 'production rate')
                cb(true)
            }
        })
    },
    removeDrugs: function (name, amount, cb) {
        var query = "UPDATE users SET drugs=-" + amount + " WHERE username='" + name + "'"
        db.query(query, function (err, result) {
            if (err) {
                console.log(err)
                cb(null)
            }
            else {
                console.log("Upgraded balance : for : " + player.character_id)
                cb(true)
            }
        })
    }
}
module.exports = player_handler;