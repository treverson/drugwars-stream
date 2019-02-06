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
                round.executeBattleFirstStep(attacker, defender, function (attack,defender) {
                    if (attack && defender)
                    {
                        second_round.continueBattle(attack, defender,function(result){
                            if(result)
                            console.log(result)
                        })
                    }
                })
            })
        })
    }

}



module.exports = battle_handler;