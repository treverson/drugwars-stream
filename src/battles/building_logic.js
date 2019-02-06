const data = require('../gamedata/buildings.json')
var buildings = []
for (i = 0; i < data.length; i++) {
    buildings.push(data[i])

}

const building_logic = {
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
    chooseNextDefenders: function (user_buildings) {
        user_buildings = user_buildings.filter(function (el) {
            return el != null;
        });
        var next_defenders = []
        if (user_buildings && user_buildings.length > 0) {
            for (i in user_buildings) {
                if (buildings.filter(function (item) { return item.id === user_buildings[i].id })) {
                    var building = buildings.filter(function (item) { return item.id === user_buildings[i].id })[0]
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
module.exports = building_logic;