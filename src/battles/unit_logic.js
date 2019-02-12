const { promisify } = require('util');
const fs = require('fs');

const readFileAsync = promisify(fs.readFile);
const units = require('../gamedata/units.json');

const unit_logic = {
  cleanArmy(user_units) {
    const result = [];
    if (user_units.length > 0) {
      for (i = 0; i < user_units.length; i++) {
        if (units.filter(item => item.id === user_units[i].unit)) {
          const unit = units.filter(item => item.id === user_units[i].unit)[0];
          const new_unit = unit;
          if (user_units[i].amount > 0) {
            new_unit.amount = user_units[i].amount;
            new_unit.pv = user_units[i].amount * new_unit.defense;
            new_unit.damage = user_units[i].amount * new_unit.attack;
            result.push(new_unit);
          }
        }
      }
    }
    return result;
  },
  chooseNextAttackersByPriority(old_army) {
    if (old_army && old_army.length > 0) {
      const fresh_army = [];
      old_army = old_army.filter(el => el != null);
      for (i = 0; i < old_army.length; i++) {
        const new_unit = units.filter(item => item.id === old_army[i].unit)[0];
        new_unit.amount = old_army[i].amount;
        new_unit.pv = new_unit.defense * old_army[i].amount;
        new_unit.damage = new_unit.attack * old_army[i].amount;
        fresh_army.push(new_unit);
      }
      return fresh_army.sort((a, b) => parseFloat(a.priority) - parseFloat(b.priority))[0];
    }
  },
  chooseNextDefAttackersByPriority(old_army) {
    if (old_army && old_army.length > 0) {
      const fresh_army = [];
      old_army = old_army.filter(el => el != null);
      for (i = 0; i < old_army.length; i++) {
        const new_unit = units.filter(item => item.id === old_army[i].unit)[0];
        new_unit.amount = old_army[i].amount;
        new_unit.pv = new_unit.defense * old_army[i].amount;
        new_unit.damage = new_unit.attack * old_army[i].amount;
        fresh_army.push(new_unit);
      }
      return fresh_army.sort((a, b) => parseFloat(a.priority) - parseFloat(b.priority))[0];
    }
  },
};
module.exports = unit_logic;
