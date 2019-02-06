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
            let cost = unit_handler.calculateCost(unit_amount, unit_placeholder);
            console.log(cost);
            // CHECK WEAPONS COST BALANCE
            if (cost > user.weapons_balance && !amount) {
              return cb('not enough weapons');
            }
            if (cost < user.weapons_balance && !amount) {
              unit_handler.AddUnits(user, now, unit_name, unit_amount, timer, cost, result => {
                if (result) return cb(result);
              });
            }
            if (amount != null) {
              amount = parseFloat(amount.split(' ')[0]).toFixed(3);
              utils.costToSteem(cost, result => {
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
                      cost,
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
  calculateTime(training_facility, unit_amount, unit_placeholder) {
    return unit_placeholder.coeff * 100 * (unit_amount ^ (2 / training_facility.lvl));
  },
  calculateCost(unit_amount, unit_placeholder) {
    return unit_placeholder.base_price * unit_amount;
  },
  AddUnits(user, now, unit_name, unit_amount, timer, cost, cb) {
    let query;
    const next_update_time = new Date(now.getTime() + timer * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    query = `UPDATE users SET weapons_balance=weapons_balance-${cost} WHERE username='${
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
