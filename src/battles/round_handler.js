
var building_logic = require('./building_logic')
var unit_logic = require('./unit_logic')


const round_handler = {
    executeBattleFirstStep: function (attacker, defender, cb) {
        var round = 15;
        attacker.units = unit_logic.cleanArmy(attacker.units)
        defender.buildings = building_logic.removeProductionBuilding(defender.buildings)
        var rc = []
        for (current_round = 1; current_round < round; current_round++) {
            var bl = defender.buildings.length
            if (defender.buildings && defender.buildings.length > 0) {
                //ATTACKER HIT BUILDINGS
                var thisround = {}

                const round_attackers = unit_logic.chooseNextAttackersByPriority(attacker.units)
                const round_defenders = building_logic.chooseNextDefenders(defender.buildings)
                if (round_attackers && round_defenders) {
                    for (at = 0; at < bl; at++) {
                        if (round_attackers && round_defenders) {
                            round_defenders.defense = Number(Math.round(round_defenders.defense - round_attackers.damage))
                            round_attackers.pv = round_attackers.pv - round_defenders.damage
                            round_attackers.amount = Math.round(round_attackers.pv / round_attackers.defense)
                            for (u in attacker.units) {
                                if (attacker.units[u] && attacker.units[u].id === round_attackers.id)
                                    if (round_attackers.amount < 1) {
                                        delete attacker.units[u]
                                    }
                                    else {
                                        attacker.units[u].amount = round_attackers.amount
                                    }
                            }
                            attacker.units = attacker.units.filter(function (el) {
                                return el != null;
                            })
                            if (round_defenders.defense < 1) {
                                for (def in defender.buildings) {
                                    if (defender.buildings[def].id === round_defenders.id)
                                        delete defender.buildings[def]
                                }
                            }
                            defender.buildings = defender.buildings.filter(function (el) {
                                return el != null;
                            });
                            //console.log(defender.buildings)
                            thisround.attacker = { attacker: round_attackers.id, damage: round_attackers.damage, amount: round_attackers.amount }
                            thisround.defender = { defender: round_defenders.id, damage: round_defenders.damage, defense: round_defenders.defense }
                            bl = defender.buildings.length
                        }
                        rc.push(thisround)

                    }
                    if (attacker.units && attacker.units.length > 0 && defender.buildings.length > 1)
                        console.log('there is still defense buildings : battle continue')
                    else if (attacker.units.length < 1) {
                        current_round = 15
                    }
                    else if (defender.buildings.length < 1) {
                        console.log('no more buildings')
                        current_round = 15
                    }
                }

            }
            else {
                current_round = 15
            }
        }
        return cb(attacker, defender,rc)
    }
}
module.exports = round_handler;