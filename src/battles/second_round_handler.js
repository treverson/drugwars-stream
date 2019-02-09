
var unit_logic = require('./unit_logic')

const second_round_handler = {
    continueBattle:function(attacker, defender, cb) {
        var rc = {}
        var aunits = attacker.units
        var cunits = defender.units
        cunits = unit_logic.cleanArmy(cunits)
        for (i = 1; i < 6; i++) {
            var round_attackers = unit_logic.chooseNextAttackersByPriority(aunits)
            var round_defenders = unit_logic.chooseNextAttackersByPriority(cunits)
            if (round_attackers && round_defenders) {
                var thisround = {}
                        thisround.start = { attacker :{attacker: round_attackers.id, damage: round_attackers.damage, pv:round_attackers.pv, amount: round_attackers.amount}, 
                            defender : { defender: round_defenders.id, damage: round_defenders.damage, pv:round_defenders.pv, amount: round_defenders.amount }  
                            }
                        round_attackers.pv = round_attackers.pv - round_defenders.damage
                        round_attackers.amount = Math.round(round_attackers.pv / round_attackers.defense)
                        round_defenders.pv = round_defenders.pv - round_attackers.damage
                        round_defenders.amount = Math.round(round_defenders.pv / round_defenders.defense)

                        for (u in aunits) {
                            if (aunits[u] && aunits[u].id === round_attackers.id)
                                if (round_attackers.amount < 1 || aunits[u].amount <1) {
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
                                if (round_defenders.amount < 1 || cunits[u].amount <1) {
                                    delete cunits[u]
                                }
                                else {
                                    cunits[u].amount = round_attackers.amount
                                }
                            cunits = cunits.filter(function (el) {
                                return el != null;
                            })
                        }
                        thisround.end = { attacker :{attacker: round_attackers.id, damage: round_attackers.damage, pv:round_attackers.pv, amount: round_attackers.amount}, 
                        defender : { defender: round_defenders.id, damage: round_defenders.damage, pv:round_defenders.pv, amount: round_defenders.amount }  
                        }
                        rc.push(thisround)
                    }
                    else{
                        if(!unit_logic.chooseNextAttackersByPriority(aunits) && unit_logic.chooseNextAttackersByPriority(cunits))
                        {
                            console.log('defender win')


                        }
                    }
            }
            aunits = aunits.filter(function (el) {
                return el != null;
            })
            cunits = cunits.filter(function (el) {
                return el != null;
            })
            
            cb(aunits, cunits,rc)
    }
}
module.exports = second_round_handler;