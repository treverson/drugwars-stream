const db = require('../helpers/db');
var round = require('./battles/round_handler')
var second_round = require('./battles/second_round_handler')
const io = require('socket.io-client');
const socket = new io.connect('https://websocket-drugwars.herokuapp.com/');

const battle_handler = {
    launchBattle: function (battle_key) {
        let query = `SELECT * FROM battles WHERE battle_key = ? ;
        SELECT * FROM battles_units WHERE battle_key = ?`
        db.query(query, [battle_key, battle_key], function (err, attacker_result) {
            if (err) {
                console.log(err)
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
                SELECT * FROM users_units WHERE username = ?;
                SELECT * FROM users WHERE username = ?`
                db.query(query, [battle.defender, battle.defender, battle.defender], function (err, defender_result) {
                    if (err) {
                        console.log(err)
                    }
                    var [buildings, units, defender_account] = defender_result;
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
                                var final_result = {attacker:attacker_res,defender:defender_res}
                                rc.push(final_result)
                                var rc = rc
                                const now = new Date()
                                .toISOString()
                                .slice(0, 19)
                                .replace('T', ' ');
                                let query = []
                                if(user_attacker.length>0)
                                {
                                
                                    for(i=0;i<user_attacker.length;i++)
                                    {
                                        query.push(`UPDATE users_units SET amount=amount+${user_attacker[i].amount} WHERE unit = '${user_attacker[i].id}' AND
                                        username = '${attacker.username}'`)
                                    }
                                    if(user_defender.length<1)
                                    {
                                        var reward = defender_account[0].drugs_balance / 2
                                        query.push(`UPDATE users SET drugs_balance=drugs_balance+${reward} WHERE username = '${attacker.username}'`)
                                        rc.reward = {reward:reward}
                                    }
                                }
                                query.push(`DELETE FROM battles_units WHERE username ='${attacker.username}' AND battle_key = '${battle_key}'`)
                                if(user_defender.length>0)
                                {
                                    for(i=0;i<user_defender.length;i++)
                                    {
                                        query.push(`UPDATE users_units SET amount=${user_defender[i].amount} WHERE unit= '${user_defender[i].id}' AND username = '${defender.username}'`)
                                    }
                                }
                                else{
                                    query.push(`DELETE FROM users_units WHERE username = '${defender.username}'`)
                                    if(user_attacker.length>0)
                                    {
                                        query.push(`UPDATE users SET drugs_balance=drugs_balance/2 WHERE username = '${defender.username}'`)
                                    }
                                }
                                query.push(`DELETE FROM battles WHERE battle_key = '${battle_key}'`)
                                query.push(`INSERT INTO battles_history (username, defender, json, date, battle_key) 
                                VALUES ('${attacker.username}','${defender.username}','${JSON.stringify(rc)}','${now}','${battle_key}')`)
                                query = query.join(' ; ')
                                db.query(query, function (err, result) {
                                if(err)
                                console.log(err)
                                else
                                console.log(result)
                                })

                                console.log(user_attacker && user_defender)
                                // return cb(true)
                                socket.emit('refresh', attacker.username);
                                socket.emit('refresh', defender.username);
                                socket.emit('attackresult', attacker.username,rc);
                                socket.emit('attackresult', defender.username,rc);
                            })
                        }
                    })
    
                })


        })
    }

}



module.exports = battle_handler;