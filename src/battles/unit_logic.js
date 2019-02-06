const data = require('../gamedata/units.json')
var units = []
for (i = 0; i < data.length; i++) {
    units.push(data[i])
}
const unit_logic = {
    cleanArmy: function (user_units) {
        this.result = []
        var placeholder = units
        if (user_units.length > 0) {
            for (i in user_units) {
                if (placeholder.filter(function (item) { return item.id === user_units[i].unit })) {
                    var unit = placeholder.filter(function (item) { return item.id === user_units[i].unit })[0]
                    if (user_units[i].amount != undefined && user_units[i].amount > 0) {
                        unit.amount = user_units[i].amount
                        unit.pv = user_units[i].amount * unit.defense
                        unit.damage = user_units[i].amount * unit.attack
                        this.result.push(unit)
                    }
                }

            }
        }
        return this.result
    },
    chooseNextAttackersByPriority: function (old_army) {
        if (old_army && old_army.length > 0) {
            var placeholder = units
            var fresh_army = []
            old_army = old_army.filter(function (el) {
                return el != null;
            });
            for (var i = 0; i < old_army.length; i++) {
                var new_unit = placeholder.filter(function (item) { return item.id === old_army[i].id })[0]
                if (new_unit && new_unit.amount != undefined) {
                    if (new_unit.amount < 0) {

                    }
                    else {
                        new_unit.pv = new_unit.defense * old_army[i].amount
                        new_unit.damage = new_unit.attack * old_army[i].amount
                        fresh_army.push(new_unit)
                    }
                }
            }
            return fresh_army.sort(function (a, b) {
                return parseFloat(a.priority) - parseFloat(b.priority)
            })[0]
        }
    }
}
module.exports = unit_logic;