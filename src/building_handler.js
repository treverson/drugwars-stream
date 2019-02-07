const db = require('../helpers/db');
const player = require('./player_handler');
const utils = require('../helpers/utils');
const {promisify} = require('util')
const fs = require('fs')
const readFileAsync = promisify(fs.readFile)
var buildings = []
    readFileAsync(`${__dirname}/../src/gamedata/buildings.json`, {encoding: 'utf8'})
    .then(contents => {
      const obj = JSON.parse(contents)
      for(i in obj)
      {
        buildings.push(obj[i])
      }
    })
    .catch(error => {
        console.log(error)
    })

const building_handler = {
  tryUpdateBuilding(user, building_name, amount, cb) {
    const query = 'SELECT * FROM users_buildings WHERE username = ?';
    db.query(query, [user.username], (err, character_buildings) => {
      if (err) {
        console.log(err);
        cb(null);
      } else {
        // CHOOSE THE PLACEHOLDER

        var building_placeholder = buildings.filter(item => item.id === building_name)[0];
        var now = new Date();
        // CHECK FOR EXISTANT BUILDING AND ADD 1 LEVEL
        var character_buildings = JSON.parse(JSON.stringify(character_buildings));
        if (character_buildings.filter(item => item.building === building_name)[0]) {
          var building = character_buildings.filter(item => item.building === building_name);
          var next_update = new Date(Date.parse(building[0].next_update));
          var building_level = building[0].lvl;
        } else {
          var building_level = 0;
          var next_update = now;
        }
        building_level += 1;
        // CHECK HEADQUARTER LEVEL
        var headquarters = character_buildings.filter(item => item.building === 'headquarters' )
        headquarters = headquarters[0]
        if (headquarters.lvl < building_level && building_name != 'headquarters') {
          return cb('hq level to low');
        }
        // CHECK LAST UPDATE
        if (next_update <= now) {
          let timer = building_handler.calculateTime(
            headquarters.lvl,
            building_level,
            building_placeholder,
          );
          console.log(building_name);
          console.log('timer : '+timer);
          console.log('cost : '+timer);

          let cost = building_handler.calculateCost(building_level, building_placeholder);
          // CHECK DRUGS COST BALANCE
          if (cost > user.drugs_balance && !amount) {
            return cb('not enough drugs');
          }
          if (cost < user.drugs_balance && !amount) {
            building_handler.upgradeBuilding(
              user,
              now,
              building_level,
              building_name,
              timer,
              building_placeholder,
              cost,
              result => {
                if (result) return cb(result);
              },
            );
          }
          if (amount != null) {
            amount = parseFloat(amount.split(' ')[0]).toFixed(3);
            utils.costToSteem(cost, result => {
              if (result)
                if (result <= amount || (result - ((result / 100) * 5)) <= amount) {
                  cost = 0;
                  timer = 1;
                  building_handler.upgradeBuilding(
                    user,
                    now,
                    building_level,
                    building_name,
                    timer,
                    building_placeholder,
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
    });
  },
  calculateTime(hq_level, building_level, building_placeholder) {
    console.log(hq_level)
    return building_placeholder.coeff * 400 * (building_level ^ (2 / hq_level));
  },
  calculateCost(building_level, building_placeholder) {
    return building_placeholder.base_price * (building_level * building_placeholder.coeff);
  },
  calculateProductionRate(building_level, building_placeholder) {
    return building_placeholder.production_rate * (building_level * building_placeholder.coeff);
  },
  upgradeBuilding(user, now, building_level, building_name, timer, building_placeholder, cost, cb) {
    let query;
    const next_update_time = new Date(now.getTime() + timer * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    // IF PRODUCE WEAPON OR DRUGS
    if (building_placeholder.production_rate > 0) {
      const old_rate = building_handler.calculateProductionRate(
        building_level - 1,
        building_placeholder,
      );
      const new_production_rate = building_handler.calculateProductionRate(
        building_level,
        building_placeholder,
      );
      // IF PRODUCE WEAPON
      if (building_placeholder.production_type === 'weapon') {
        user.weapon_production_rate = user.weapon_production_rate - old_rate + new_production_rate;
        query = `UPDATE users SET weapon_production_rate=${
          user.weapon_production_rate
        }, drugs_balance=drugs_balance-${cost} WHERE username='${user.username}';
                INSERT INTO users_buildings (username , building, lvl, next_update) VALUES ('${
                  user.username
                }','${building_placeholder.id}', ${building_level},'${next_update_time}') 
                ON DUPLICATE KEY UPDATE lvl=${building_level}, next_update='${next_update_time}'`;
      } else {
        user.drug_production_rate = user.drug_production_rate - old_rate + new_production_rate;
        query = `UPDATE users SET drug_production_rate=${
          user.drug_production_rate
        }, drugs_balance=drugs_balance-${cost} WHERE username='${user.username}';
                INSERT INTO users_buildings (username , building, lvl, next_update) VALUES ('${
                  user.username
                }','${building_placeholder.id}', ${building_level},'${next_update_time}') 
                ON DUPLICATE KEY UPDATE lvl=${building_level}, next_update='${next_update_time}'`;
      }
    }
    // IF DOESNT PRODUCE ANYTHING
    else {
      query = `UPDATE users SET drugs_balance=drugs_balance-${cost} WHERE username='${
        user.username
      }';
            INSERT INTO users_buildings (username , building, lvl, next_update) VALUES ('${
              user.username
            }','${building_placeholder.id}', ${building_level},'${next_update_time}')
            ON DUPLICATE KEY UPDATE lvl=${building_level}, next_update='${next_update_time}'`;
    }
    db.query(query, (err, result) => {
      if (err) {
        console.log(err);
        cb(err);
      } else {
        console.log(`Upgraded character building : ${building_name} for : ${user.username}`);
        cb('success');
      }
    });
  },
};
module.exports = building_handler;
