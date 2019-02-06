var db = require('../lib/db');
const unitdata = require('../gamedata/units.json')
const buildingdata = require('../gamedata/buildings.json')
const helpers = require('../utils/battle_helpers')


function returnNewArmy(army, attacker) {
    var new_army = []
    for (u = 0; u < army.length; u++) {
        if (army[u].unit === attacker.id) {
            if (attacker.amount > 1) {
                army[u].amount = attacker.amount
                new_army.push(army[u])
            }
        }
        else {
            new_army.push(army[u])
        }
        return new_army
    }
}

function returnNewBuildings(buildings, defender) {
    var new_buildings = []
    console.log(buildings)
    for (u = 0; u < buildings.length; u++) {
        if (buildings[u].building === defender.id || buildings[u].id === defender.id) {
            if (defender.pv > 1) {
                console.log(defender.id)
                new_buildings.push(buildings[u])
            }
        }
        else {
            new_buildings.push(buildings[u])
        }
        return new_buildings
    }
}

function executeBattleFirstStep(attacker, defender, cb) {
    defender.buildings = helpers.removeProductionBuilding(defender.buildings)
    if (defender.buildings.length > 0) {
        //ATTACKER HIT BUILDINGS
        var thisround = {}
        var round_attackers = helpers.chooseNextAttackersByPriority(attacker.units)
        var round_defenders = helpers.chooseNextDefendersBuildingByPriority(defender.buildings)
        for (at = 0; at < defender.buildings.length; at++) {
            console.log(defender.buildings.length)

            if (round_attackers && round_defenders) {
                round_defenders.pv = (round_defenders.pv) - round_attackers.damage
             
                round_attackers.pv = round_attackers.pv - round_defenders.damage
                round_attackers.amount = round_attackers.pv / round_attackers.defense
          

                for (u = 0; u < defender.buildings.length; u++) {
                    if (defender.buildings[u].building === round_defenders.id || defender.buildings[u].id === round_defenders.id) {
                        console.log(defender.buildings[u])
                    }
                }
                // if (round_defenders.pv < 1) {
                //     for (def in defender.buildings) {
                //         if (defender.buildings[def].building === round_defenders.id)
                //             delete defender.buildings[def]
                //     }
                // }
                //console.log(defender.buildings)

                defender.buildings = returnNewBuildings(defender.buildings, round_defenders)
                attacker.units = returnNewArmy(attacker.units, round_attackers)
            }

            console.log(thisround)
            thisround.attacker = { attacker: round_attackers.id, damage: round_attackers.damage, amount: round_attackers.amount, pv: round_attackers.pv }
            thisround.defender = { defender: round_defenders.id, damage: round_defenders.damage, pv: round_defenders.pv }
            //rc.rounds.push(thisround)


            if (attacker.units && attacker.units.length > 0 && defender.buildings && defender.buildings.length < 1) {
                continueBattle(attacker, defender)
            }
            else {
                if (attacker.units.length < 1)
                    console.log('attacker lost all units')
                else {
                    console.log('battle continue')
                }
                // console.log(defender.buildings)
                // console.log(attacker.units)
                // console.log('battle stopped')
            }
        }



    }
    else{
        console.log('no defense buildings')
    }

}
function continueBattle(attacker, defender, cb) {
    let round = 6;
    for (current_round = 1; current_round < round; current_round++) {
        //console.log('round ' + current_round)
        // var round_attackers = helpers.chooseNextAttackersByPriority(attacker.units)
        // var round_defenders = helpers.chooseNextDefendersByPriority(defender.units)
        //console.log(attacker.units)
        // console.log(defender.units)
        //round_defenders.amount = round_defenders.pv / round_defenders.defense
        // round_attackers.pv = round_attackers.pv - round_defenders.damage
        // round_attackers.amount = round_attackers.pv / round_attackers.defense
        // if (round_attackers.amount < 1) {
        //     for (element in attacker.units) {
        //         if (attacker.units[element].unit === round_attackers.id)
        //             delete attacker.units[element]
        //     }
        // }
        // else {
        //     var new_army = []
        //     for (element in attacker.units) {
        //         if (attacker.units[element].unit === round_attackers.id) {
        //             attacker.units[element].amount = round_attackers.amount
        //             new_army.push(attacker.units[element])
        //         }
        //         else {
        //             new_army.push(attacker.units[element])
        //         }

        //     }
        //     attacker.units = new_army
        //     attacker.units = attacker.units.filter(function (el) {
        //         return el != null;
        //     });
        // }

        // if (round_defenders.amount < 1) {
        //     for (def in defender.units) {
        //         if (defender.units[def].unit === round_defenders.id)
        //             delete defender.units[def]
        //     }
        // }



        // var new_armytwo = []
        // for (elem in defender.units) {
        //     if (defender.units[elem].unit === round_defenders.id) {
        //         new_armytwo.push(defender.units[elem])
        //     }
        //     else {
        //         new_armytwo.push(defender.units[elem])
        //     }

        // }
        // defender.units = new_armytwo
        // defender.units = defender.units.filter(function (el) {
        //     return el != null;
        // });


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