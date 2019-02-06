
var unit_logic = require('./unit_logic')
var unit_logic_def = require('./def_unit_logic')

const second_round_handler = {
    continueBattle:function(attacker, defender, cb) {
        var aunits = attacker.units
        var cunits = defender.units
        cunits = unit_logic_def.cleanArmy(cunits)
        for (i = 1; i < 5; i++) {
            var round_attackers = unit_logic.chooseNextAttackersByPriority(aunits)
            var round_defenders = unit_logic_def.chooseNextAttackersByPriority(cunits)
            if (round_attackers && round_defenders) {
                        round_attackers.pv = round_attackers.pv - round_defenders.damage
                        round_attackers.amount = Math.round(round_attackers.pv / round_attackers.defense)
                        round_defenders.pv = round_defenders.pv - round_attackers.damage
                        round_defenders.amount = Math.round(round_defenders.pv / round_defenders.defense)
                        var thisround = {}
                        console.log(round_attackers.amount, round_attackers.id)
                        console.log(round_defenders.id, round_defenders.pv)
                        for (u in aunits) {
                            if (aunits[u] && aunits[u].id === round_attackers.id)
                                if (round_attackers.amount < 1) {
                                    delete aunits[u]
                                }
                                else {
                                    aunits[u].amount = round_attackers.amount
                                }
                            aunits = aunits.filter(function (el) {
                                return el != null;
                            })
                        }
                        for (u in cunits) {
                            if (cunits[u] && cunits[u].id === round_defenders.id)
                                if (round_defenders.amount < 1) {
                                    delete cunits[u]
                                }
                                else {
                                    cunits[u].amount = round_attackers.amount
                                }
                            cunits = cunits.filter(function (el) {
                                return el != null;
                            })
                        }
                        //console.log(defender.buildings)
                        thisround.attacker = { attacker: round_attackers.id, damage: round_attackers.damage, amount: round_attackers.amount }
                        thisround.defender = { defender: round_defenders.id, damage: round_defenders.damage, defense: round_defenders.defense }
                        // defender.buildings = returnNewBuildings(defender.buildings, round_defenders)
                        // attacker.units = returnNewArmy(attacker.units, round_attackers)
                    }


                
                if (aunits && aunits.length > 0 && cunits && cunits.length < 1) {
                    console.log('attacker win')
                    cb(attacker, defender)
                }
                else {
                    if (aunits && aunits.length > 0 && cunits.length > 1)
                        console.log('battle continue')
                    else if (aunits.length < 1) {
                        cb(false)
                    }
                    else console.log('draw')
                }
            }

    }
}
module.exports = second_round_handler;