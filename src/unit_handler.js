const db = require('../helpers/db');
const player = require('./player_handler');
const utils = require('../helpers/utils');
const units = require('./gamedata/units.json');

const unit_handler = {
  tryAddUnit(user, unit_name, unit_amount, amount, cb) {
    const query =
      'SELECT * FROM users_units WHERE username = ?; \n\
            SELECT * FROM users_buildings WHERE username = ?';
    db.query(
      query,
      [user.username, user.username],
      (err, [character_units, character_buildings]) => {
        if (err) {
          console.log(err);
          cb(null);
        } else {
          // CHOOSE THE PLACEHOLDER
          console.log(unit_name);
          const unit_placeholder = units.filter(item => item.id === unit_name)[0];
          const now = new Date();
          // CHECK FOR TRAINING FACILITY
          const training_facility = character_buildings.filter(
            item => item.building === 'training_facility',
          )[0];
          if (!training_facility && !training_facility.lvl < 1) {
            return cb('training facility to low');
          }
          if (character_units.filter(item => item.unit === unit_name)[0]) {
            const unit = character_units.filter(item => item.unit === unit_name);
            var next_update = new Date(Date.parse(unit[0].next_update));
          } else {
            var next_update = now;
          }
          // CHECK LAST UPDATE
          if (next_update <= now) {
            let timer = unit_handler.calculateTime(
              training_facility,
              unit_amount,
              unit_placeholder,
            );
            console.log(timer);
            var d_cost = unit_handler.calculateDrugsCost(unit_amount,unit_placeholder)
            var w_cost = unit_handler.calculateWeaponsCost(unit_amount,unit_placeholder)
            var a_cost = unit_handler.calculateAlcoholsCost(unit_amount,unit_placeholder)
            console.log(d_cost,w_cost,a_cost)
            // CHECK WEAPONS COST BALANCE
            if (!utils.ifCanBuy(user, d_cost,w_cost,a_cost) && amount === null) {
              return cb('not enough weapons');
            }
            if (utils.ifCanBuy(user, d_cost,w_cost,a_cost) && amount === null) {
              unit_handler.AddUnits(user, now, unit_name, unit_amount, timer, d_cost,w_cost,a_cost, result => {
                if (result) return cb(result);
              });
            }
            if (amount != null) {
              amount = parseFloat(amount.split(' ')[0]).toFixed(3);
              utils.costToSteem(w_cost, result => {
                if (result)
                  if (result <= amount || result - (result / 100) * 5 <= amount) {
                    cost = 0;
                    timer = 1;
                    unit_handler.AddUnits(
                      user,
                      now,
                      unit_name,
                      unit_amount,
                      timer,
                      0,
                      0,
                      0,
                      result => {
                        if (result) return cb(result);
                      },
                    );
                  } else
                    return cb(
                      `you must send more STEEM the difference was :${parseFloat(
                        result - amount,
                      ).toFixed(3)} STEEM`,
                    );
              });
            }
          } else {
            return cb('need to wait');
          }
        }
      },
    );
  },
  calculateDrugsCost(unit_amount, unit_placeholder) {
    if(unit_placeholder.drugs_cost)
    return unit_placeholder.drugs_cost * unit_amount
    else return unit_placeholder.drugs_cost
  },
  calculateWeaponsCost(unit_amount, unit_placeholder) {
    if(unit_placeholder.weapons_cost)
    return unit_placeholder.weapons_cost * unit_amount
    else return unit_placeholder.weapons_cost
  },
  calculateAlcoholsCost(unit_amount, unit_placeholder) {
    if(unit_placeholder.alcohols_cost)
    return unit_placeholder.alcohols_cost * unit_amount
    else return unit_placeholder.alcohols_cost
  },
  calculateTime(training_facility, unit_amount, unit_placeholder) {
    return ((unit_placeholder.coeff * 80) - (training_facility.lvl*10/100)) * unit_amount
  },
  AddUnits(user, now, unit_name, unit_amount, timer, d_cost,w_cost,a_cost, cb) {
    let query;
    const next_update_time = new Date(now.getTime() + timer * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    query = `UPDATE users SET drugs_balance=drugs_balance-${d_cost},
    weapons_balance=weapons_balance-${w_cost}, alcohols_balance=alcohols_balance-${a_cost} WHERE username='${
      user.username
    }'; \n\
            INSERT INTO users_units (username, unit, amount, next_update) VALUES ('${
              user.username
            }','${unit_name}',${unit_amount},'${next_update_time}') \n\
            ON DUPLICATE KEY UPDATE amount=amount+${unit_amount}, next_update='${next_update_time}'`;
    db.query(query, (err, result) => {
      if (err) {
        console.log(result);
        cb(err);
      } else {
        console.log(`Addd ${unit_amount} units :${unit_name} for : ${user.username}`);
        cb('success');
      }
    });
  },
};
module.exports = unit_handler;
