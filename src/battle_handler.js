const db = require('../helpers/db');

const building_logic = require('./battles/building_logic')
var unit_logic = require('./battles/unit_logic')
var unit_logic_def = require('./battles/unit_logic')

function executeBattleFirstStep(attacker, defender, cb) {
    let round = 15;
    attacker.units = unit_logic.cleanArmy(attacker.units)
    defender.buildings = building_logic.removeProductionBuilding(defender.buildings)
    for (current_round = 1; current_round < round; current_round++) {
        var bl = defender.buildings.length
        if (defender.buildings && defender.buildings.length > 0) {
            //ATTACKER HIT BUILDINGS
            var thisround = {}
            
            var round_attackers = unit_logic.chooseNextAttackersByPriority(attacker.units)
            var round_defenders = building_logic.chooseNextDefenders(defender.buildings)
            if (round_attackers && round_defenders)
            {
                for (at = 0; at < bl; at++) {
                    round_attackers = unit_logic.chooseNextAttackersByPriority(attacker.units)
                    round_defenders = building_logic.chooseNextDefenders(defender.buildings)
                    if (round_attackers && round_defenders) {
                        round_defenders.defense = Number(Math.round(round_defenders.defense - round_attackers.damage))
                        round_attackers.pv = round_attackers.pv - round_defenders.damage
                        round_attackers.amount = Math.round(round_attackers.pv / round_attackers.defense)
                        console.log(round_attackers.amount, round_attackers.id)
                        console.log(round_defenders.id, round_defenders.pv)
                        for (u in attacker.units) {
                            if (attacker.units[u] && attacker.units[u].id === round_attackers.id)
                                if (round_attackers.amount < 1) {
                                    delete attacker.units[u]
                                }
                                else {
                                    attacker.units[u].amount = round_attackers.amount
                                }
                            attacker.units = attacker.units.filter(function (el) {
                                return el != null;
                            })
                        }
                        if (round_defenders.defense < 1) {
                            for (def in defender.buildings) {
                                if (defender.buildings[def].id === round_defenders.id)
                                    delete defender.buildings[def]
                            }
                            defender.buildings = defender.buildings.filter(function (el) {
                                return el != null;
                            });
                        }
                        //console.log(defender.buildings)
                        thisround.attacker = { attacker: round_attackers.id, damage: round_attackers.damage, amount: round_attackers.amount }
                        thisround.defender = { defender: round_defenders.id, damage: round_defenders.damage, defense: round_defenders.defense }
                        // defender.buildings = returnNewBuildings(defender.buildings, round_defenders)
                        // attacker.units = returnNewArmy(attacker.units, round_attackers)
                        bl = defender.buildings.length
                    }

                   
                }
                if (attacker.units && attacker.units.length > 0 && defender.buildings && defender.buildings.length < 1) {
                    continueBattle(attacker, defender)
                }
                else {
                    if (attacker.units && attacker.units.length > 0 && defender.buildings.length > 1)
                        console.log('battle continue')
                   else if (attacker.units.length > 0 && defender.buildings.length < 1)
                   {
                    console.log('attacker defeated buildings')
                   }
                   else console.log('bra')
                }
            }
            
        }
        else {
            console.log('no defense buildings')
            continueBattle(attacker,defender)
        }
    }

}
function continueBattle(attacker, defender, cb) {
    let round = 6;
    const aunits = attacker.units
    console.log('BUG ICIIIIII' + current_round)
    defender.units = unit_logic_def.cleanArmy(defender.units)
    for (current_round = 1; current_round < round; current_round++) {

        var round_attackers = unit_logic.chooseNextAttackersByPriority(aunits)
        var round_defenders = unit_logic_def.chooseNextAttackersByPriority(defender.units)
        console.log(attacker.units)



    }


}

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
                executeBattleFirstStep(attacker, defender, function (error) {
                    if (error)
                        console.log(error)
                })
            })
        })
    }

}



module.exports = battle_handler;