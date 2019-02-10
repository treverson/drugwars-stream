var fs = require('fs');

const second_round_handler = {
    cleanArmy: function (user_units) {
        var result = []
          if (user_units.length > 0) {
            const units = JSON.parse(fs.readFileSync('./src/gamedata/units.json', 'utf8'));
            for (i = 0; i < user_units.length; i++) {
                if (units.filter(function (item) { return item.id === user_units[i].unit })) {
                    var unit = units.filter(function (item) { return item.id === user_units[i].unit })[0]
                    var new_unit = unit
                    if (user_units[i].amount > 0) {
                        new_unit.amount = user_units[i].amount
                        new_unit.pv = user_units[i].amount * new_unit.defense
                        new_unit.damage = user_units[i].amount * new_unit.attack
                        result.push(new_unit)
                    }
                }
            }
        }
        return result

    },
    chooseNextAttackersByPriority: function (old_army) {
        if (old_army && old_army.length > 0) {
            const fresh_army = []
            var old_army = old_army.filter(function (el) {
                return el != null;
            });
            const units = JSON.parse(fs.readFileSync('./src/gamedata/units.json', 'utf8'));
            for (i = 0; i < old_army.length; i++) {
                const new_unit = units.filter(function (item) { return item.id === old_army[i].unit })[0]
                    new_unit.amount = old_army[i].amount
                    new_unit.pv = new_unit.defense * old_army[i].amount
                    new_unit.damage = new_unit.attack * old_army[i].amount
                    fresh_army.push(new_unit)
            }
            return fresh_army.sort(function (a, b) {
                return parseFloat(a.priority) - parseFloat(b.priority)
            })[0]
        }
    },
    chooseNextDefAttackersByPriority: function (old_army) {
        if (old_army && old_army.length > 0) {
            const fresh_army = []
            var old_army = old_army.filter(function (el) {
                return el != null;
            });
            const units = JSON.parse(fs.readFileSync('./src/gamedata/units.json', 'utf8'));
            for (i = 0; i < old_army.length; i++) {
                const new_unit = units.filter(function (item) { return item.id === old_army[i].unit })[0]
                new_unit.amount = old_army[i].amount
                new_unit.pv = new_unit.defense * old_army[i].amount
                new_unit.damage = new_unit.attack * old_army[i].amount
                fresh_army.push(new_unit)
            }
            return fresh_army.sort(function (a, b) {
                return parseFloat(a.priority) - parseFloat(b.priority)
            })[0]
        }
    },
    continueBattle:function(attacker, defender, cb) {
        var rc = {}
        var aunits = attacker
        var cunits = defender
        const start = {}
        start.attacker  = []
        start.defender  = []
        for(w=0;w<attacker.length;w++)
        {
            start.attacker.push(attacker[w])
        }
        for(z=0;z<defender.length;z++)
        {
            start.defender.push(defender[z])
        }
        rc.start = start
        rc.rounds=[]
        for (i = 1; i < 6; i++) {
            var round_attackers = second_round_handler.chooseNextAttackersByPriority(aunits)
            var round_defenders = second_round_handler.chooseNextDefAttackersByPriority(cunits)
            if (round_attackers && round_defenders) {
                round_attackers.start_amount = Math.round(round_attackers.pv / round_attackers.defense)
                round_defenders.start_amount = Math.round(round_defenders.pv / round_defenders.defense)
                        round_attackers.pv = round_attackers.pv - round_defenders.damage
                        round_attackers.amount = Math.round(round_attackers.pv / round_attackers.defense)
                        if(round_attackers.amount<1)
                        {
                            round_attackers.pv = 0
                            round_attackers.amount = 0
                        }

                        round_defenders.pv = round_defenders.pv - round_attackers.damage
                        round_defenders.amount = Math.round(round_defenders.pv / round_defenders.defense)
                        if(round_defenders.amount<1)
                        {
                            round_defenders.pv=0
                            round_defenders.amount = 0

                        }

                        for (u in aunits) {
                            if (aunits[u] && aunits[u].unit === round_attackers.id)
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
                            if (cunits[u] && cunits[u].unit === round_defenders.id)
                                if (round_defenders.amount < 1 || cunits[u].amount <1) {
                                    delete cunits[u]
                                }
                                else {
                                    cunits[u].amount = round_defenders.amount
                                }
                            cunits = cunits.filter(function (el) {
                                return el != null;
                            })
                        }
                        rc.rounds.push({roundnumber:i})
                        rc.rounds.push({ attacker :{attacker: round_attackers.id,start_amount:round_attackers.start_amount, damage: round_attackers.damage, pv:round_attackers.pv, amount: round_attackers.amount}, 
                        defender : { defender: round_defenders.id,start_amount:round_defenders.start_amount, damage: round_defenders.damage, pv:round_defenders.pv, amount: round_defenders.amount }})  
                        
                    }
                    else{
                        if(!second_round_handler.chooseNextAttackersByPriority(aunits) && second_round_handler.chooseNextDefAttackersByPriority(cunits))
                        {

                            console.log('defender win')
                            rc.winner = 'defender'
                            i=6
                        }
                        else if(second_round_handler.chooseNextAttackersByPriority(aunits) && !second_round_handler.chooseNextDefAttackersByPriority(cunits))
                        {

                            console.log('attacker win')
                            rc.winner = 'attacker'
                            i=6
                        }
                    }
            }
            aunits = aunits.filter(function (el) {
                return el != null;
            })
            cunits = cunits.filter(function (el) {
                return el != null;
            })
            
            return cb(aunits, cunits,rc)
    }
}
module.exports = second_round_handler;