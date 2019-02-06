const units = require('../src/gamedata/units.json');
const buildings = require('../src/gamedata/buildings.json');

const battle_helpers = {
  removeProductionBuilding(user_buildings) {
    const result = [];
    if (user_buildings.length > 0) {
      for (i in user_buildings) {
        if (buildings.filter(item => item.id === user_buildings[i].building)) {
          building = buildings.filter(item => item.id === user_buildings[i].building)[0];
          building.pv = user_buildings[i].lvl * building.defense;
          building.damage = building.attack * user_buildings[i].lvl;
          if (building.priority < 10) {
            result.push(building);
          }
        }
      }
    }
    return result;
  },

  chooseNextAttackersByPriority(army) {
    army = army.filter(el => el != null);
    const next_units = [];
    for (var i = 0; i < army.length; i++) {
      const new_unit = units.filter(item => item.id === army[i].unit)[0];
      new_unit.amount = army[i].amount;
      new_unit.pv = new_unit.defense * army[i].amount;
      new_unit.damage = new_unit.attack * army[i].amount;
      next_units.push(new_unit);
    }
    return next_units.sort((a, b) => parseFloat(a.priority) - parseFloat(b.priority))[0];
  },

  chooseNextDefendersByPriority(army) {
    army = army.filter(el => el != null);
    const next_units = [];
    if (army.length > 0) {
      const unitstofilter = units;
      for (var i = 0; i < army.length; i++) {
        if (unitstofilter.filter(item => item.id === army[i].unit)) {
          const new_unit = unitstofilter.filter(item => item.id === army[i].unit)[0];
          new_unit.amount = army[i].amount;
          new_unit.pv = new_unit.defense * army[i].amount;
          new_unit.damage = new_unit.attack * army[i].amount;
          next_units.push(new_unit);
        }
        return next_units.sort((a, b) => parseFloat(a.priority) - parseFloat(b.priority))[0];
      }
    }
  },

  chooseNextDefendersBuildingByPriority(user_buildings) {
    user_buildings = user_buildings.filter(el => el != null);
    const next_defenders = [];
    if (user_buildings && user_buildings.length > 0) {
      for (i in user_buildings) {
        if (buildings.filter(item => item.id === user_buildings[i].id)) {
          building = buildings.filter(item => item.id === user_buildings[i].id)[0];
          if (building.priority < 10) {
            next_defenders.push(building);
          }
        }
      }
    }
    return next_defenders.sort((a, b) => parseFloat(a.priority) - parseFloat(b.priority))[0];
  },
};

module.exports = battle_helpers;
