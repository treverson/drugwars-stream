const db = require('../helpers/db');
var round = require('./battles/round_handler')
var second_round = require('./battles/second_round_handler')

const battle_handler = {
    launchBattle: function (battle_key, cb) {
        let query = `SELECT * FROM battles WHERE battle_key = ? ;
        SELECT * FROM battles_units WHERE battle_key = ?`
        db.query(query, [battle_key, battle_key], function (err, attacker_result) {
            if (err) {
                console.log(err)
                return cb(null);
            }
            var [[battle], units] = attacker_result;
            var attacker = {}
            attacker.username = battle.username
            console.log(battle)
            units = JSON.parse(JSON.stringify(units))
            attacker.units = []
            for (i = 0; i < units.length; i++) {
                attacker.units.push(units[i])
            }
            let query = `SELECT * FROM users_buildings WHERE username = ? ;
            SELECT * FROM users_units WHERE username = ?`
            db.query(query, [battle.defender, battle.defender], function (err, defender_result) {
                if (err) {
                    console.log(err)
                    return cb(null);
                }
                var [buildings, units] = defender_result;
                var defender = {}
                defender.username = battle.defender
                units = JSON.parse(JSON.stringify(units))
                buildings = JSON.parse(JSON.stringify(buildings))
                defender.units = []
                defender.buildings = []
                for (i = 0; i < buildings.length; i++) {
                    defender.buildings.push(buildings[i])
                }
                for (i = 0; i < units.length; i++) {
                    defender.units.push(units[i])
                }
                round.executeBattleFirstStep(attacker, defender, function (attacker_res,defender_res,frc) {
                    if (attacker_res && defender_res)
                    {
                        second_round.continueBattle(attacker_res, defender_res,frc ,function(user_attacker,user_defender,rc){
                            var rc = JSON.stringify(rc)
                            const now = new Date()
                            .toISOString()
                            .slice(0, 19)
                            .replace('T', ' ');
                            if(user_attacker.length>0)
                            {
                                let query = []
                                query.push(`DELETE FROM battles WHERE battle_key = '${battle_key}'`)
                                query.push(`INSERT INTO battles_history (username, defender, json, date, battle_key) 
                                VALUES ('${attacker.username}','${defender.username}','${rc}','${now}','${battle_key}')`)
                                for(i=0;i<user_attacker.length;i++)
                                {
                                    query.push(`UPDATE users_units SET amount=amount+${user_attacker[i].amount} WHERE unit='${user_attacker[i].id}' AND
                                    username = '${attacker.username}'`)
                                    query.push(`DELETE FROM battles_units WHERE unit='${user_attacker[i].id}' AND
                                    username = '${attacker.username}' AND battle_key = '${battle_key}'`)
                                }
                                query = query.join(';')
                                db.query(query, (err, result) => {
                                    if (err || !result || !result[0]) {
                                      console.log(`error for updating attacker units ${err}`);
                                      cb(null);
                                    }
                                    console.log(`Updated attackers unit play`);
                                  });
                            }
                            else{
                                let query = `DELETE FROM battles_units WHERE username = ? ;
                                DELETE FROM battles WHERE username = ? AND battle_key= ? ;`
                                db.query(query, [attacker.username,attacker.username,battle_key], function (err, result) {
                                if(err)
                                console.log(err)
                                else
                                console.log('removed all battles units for ' + attacker.username)
                                console.log(result)
                                })
                            }
                            if(user_defender.length>0)
                            {
                                let query = []
                                for(i=0;i<user_defender.length;i++)
                                {
                                    query.push(`UPDATE users_units SET amount=${user_defender[i].amount} WHERE unit='${user_defender[i].id}' 
                                    username = '${user_defender.username}'`)
                                }
                                query = query.join(';')
                                db.query(query, (err, result) => {
                                    if (err || !result || !result[0]) {
                                      console.log(`error for updating attacker units ${err}`);
                                      cb(null);
                                    }
                                    console.log(`Updated attackers unit play`);
                                  });
                            }
                            else{
                                let query = `DELETE FROM users_units WHERE username = ? ;`
                                db.query(query, [defender.username], function (err, result) {
                                if(err)
                                console.log(err)
                                else
                                console.log('removed all base units for ' + defender.username)
                                console.log(result)
                                })
                            }
                            console.log(user_attacker && user_defender)
                            // return cb(true)
                        })
                    }
                })

            })

        })
    }

}



module.exports = battle_handler;