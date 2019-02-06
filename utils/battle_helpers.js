var unitdata = require('../gamedata/units.json')
var buildingdata = require('../gamedata/buildings.json')
var units = []
var buildings = []
for (i = 0; i < unitdata.units.length; i++) {
    units.push(unitdata.units[i])
}
for (i = 0; i < buildingdata.buildings.length; i++) {
    buildings.push(buildingdata.buildings[i])
}

const battle_helpers = {
    removeProductionBuilding: function (user_buildings) {
        var result = []
        if (user_buildings.length > 0) {
            for (i in user_buildings) {
                if (buildings.filter(function (item) { return item.id === user_buildings[i].building })) {
                    building = buildings.filter(function (item) { return item.id === user_buildings[i].building })[0]
                    building.pv = user_buildings[i].lvl * building.defense
                    building.damage = building.attack * user_buildings[i].lvl
                    if (building.priority < 10) {
                        result.push(building)
                    }
                }

            }
        }
        return result
    },

    chooseNextAttackersByPriority: function (army) {
        army = army.filter(function (el) {
            return el != null;
        });
        var next_units = []
        for (var i = 0; i < army.length; i++) {
            var new_unit = units.filter(function (item) { return item.id === army[i].unit })[0]
            new_unit.amount = army[i].amount
            new_unit.pv = new_unit.defense * army[i].amount
            new_unit.damage = new_unit.attack * army[i].amount
            next_units.push(new_unit)
        }
        return next_units.sort(function (a, b) {
            return parseFloat(a.priority) - parseFloat(b.priority)
        })[0]
    },


    chooseNextDefendersByPriority: function (army) {
        army = army.filter(function (el) {
            return el != null;
        });
        var next_units = []
        if (army.length > 0) {
            var unitstofilter = units
            for (var i = 0; i < army.length; i++) {
                if (unitstofilter.filter(function (item) { return item.id === army[i].unit })) {
                    var new_unit = unitstofilter.filter(function (item) { return item.id === army[i].unit })[0]
                    new_unit.amount = army[i].amount
                    new_unit.pv = new_unit.defense * army[i].amount
                    new_unit.damage = new_unit.attack * army[i].amount
                    next_units.push(new_unit)
                }
                return next_units.sort(function (a, b) {
                    return parseFloat(a.priority) - parseFloat(b.priority)
                })[0]
            }

        }
    },

    chooseNextDefendersBuildingByPriority: function (user_buildings) {
        user_buildings = user_buildings.filter(function (el) {
            return el != null;
        });
        var next_defenders = []
        if (user_buildings && user_buildings.length > 0) {
            for (i in user_buildings) {
                if (buildings.filter(function (item) { return item.id === user_buildings[i].id })) {
                    building = buildings.filter(function (item) { return item.id === user_buildings[i].id })[0]
                    if (building.priority < 10) {
                        next_defenders.push(building)
                    }
                }

            }
        }
        return next_defenders.sort(function (a, b) {
            return parseFloat(a.priority) - parseFloat(b.priority);
        })[0]
    }
}
module.exports = battle_helpers;