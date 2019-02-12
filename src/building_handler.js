const db = require('../helpers/db');
const player = require('./player_handler');
const utils = require('../helpers/utils');
const { promisify } = require('util');
const fs = require('fs');

const readFileAsync = promisify(fs.readFile);
const buildings = [];
readFileAsync(`${__dirname}/../src/gamedata/buildings.json`, { encoding: 'utf8' })
  .then(contents => {
    const obj = JSON.parse(contents);
    for (i in obj) {
      buildings.push(obj[i]);
    }
  })
  .catch(error => {
    console.log(error);
  });

const building_handler = {
  tryUpdateBuilding(user, building_name, amount, cb) {
    const query = 'SELECT * FROM users_buildings WHERE username = ?';
    db.query(query, [user.username], (err, character_buildings) => {
      if (err) {
        console.log(err);
        cb(null);
      } else {
        // CHOOSE THE PLACEHOLDER
        const building_placeholder = buildings.filter(item => item.id === building_name)[0];
        var character_buildings = JSON.parse(JSON.stringify(character_buildings));
        const now = new Date();
        // CHECK FOR EXISTANT BUILDING AND GET NEXT LEVEL/UPDATE
        let building_level = 0;
        let next_update = now;
        if (building_placeholder) {
          if (character_buildings.filter(item => item.building === building_name)[0]) {
            const building = character_buildings.filter(item => item.building === building_name);
            next_update = new Date(Date.parse(building[0].next_update));
            building_level = building[0].lvl;
          }
          // ADD HEADQUARTER & CHECK LEVEL
          const headquarters = character_buildings.filter(
            item => item.building === 'headquarters',
          )[0];
          if (headquarters.lvl < building_level && building_name != 'headquarters') {
            return cb('hq level to low');
          }
          // CHECK LAST UPDATE FOR THIS BUILDING
          if (next_update <= now) {
            let timer = building_handler.calculateTime(
              headquarters.lvl,
              building_level,
              building_placeholder,
            );
            console.log(building_name);
            console.log(user);
            const d_cost = building_handler.calculateDrugsCost(
              building_level,
              building_placeholder,
            );
            const w_cost = building_handler.calculateWeaponsCost(
              building_level,
              building_placeholder,
            );
            const a_cost = building_handler.calculateAlcoholsCost(
              building_level,
              building_placeholder,
            );
            console.log(`timer : ${timer}`);
            console.log(`cost : ${d_cost}`, w_cost, a_cost);
            // CHECK DRUGS COST BALANCE
            if (!utils.ifCanBuy(user, d_cost, w_cost, a_cost) && amount === null) {
              return cb('not enough drugs');
            }
            if (utils.ifCanBuy(user, d_cost, w_cost, a_cost) && amount === null) {
              building_handler.upgradeBuilding(
                user,
                now,
                building_level,
                building_name,
                timer,
                building_placeholder,
                d_cost,
                w_cost,
                a_cost,
                result => {
                  if (result) return cb(result);
                },
              );
            }
            if (amount != null) {
              amount = parseFloat(amount.split(' ')[0]).toFixed(3);
              utils.costToSteem(d_cost, result => {
                if (result)
                  if (result <= amount || result - (result / 100) * 5 <= amount) {
                    timer = 1;
                    building_handler.upgradeBuilding(
                      user,
                      now,
                      building_level,
                      building_name,
                      timer,
                      building_placeholder,
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
        } else {
          return cb('building doesnt exist');
        }
      }
    });
  },
  calculateTime(hq_level, building_level, building_placeholder) {
    if (building_placeholder && building_placeholder.id != 'headquarters')
      return (
        (building_placeholder.coeff *
          2000 *
          ((Math.sqrt(625 + 100 * ((building_level + 1) * 250)) - 25) / 50)) /
        hq_level
      );
    return 2500 * ((Math.sqrt(625 + 100 * ((building_level + 1) * 250)) - 25) / 50);
  },
  calculateDrugsCost(building_level, building_placeholder) {
    if (building_placeholder.drugs_cost && building_level > 0)
      return (
        (building_placeholder.drugs_cost *
          (building_level + 1 * (building_level + 1) * (2 * (building_level + 1)))) /
        5
      );
    return building_placeholder.drugs_cost;
  },
  calculateWeaponsCost(building_level, building_placeholder) {
    if (building_placeholder.weapons_cost && building_level > 0)
      return (
        (building_placeholder.weapons_cost *
          (building_level + 1 * (building_level + 1) * (2 * (building_level + 1)))) /
        5
      );
    return building_placeholder.weapons_cost;
  },
  calculateAlcoholsCost(building_level, building_placeholder) {
    if (building_placeholder.alcohols_cost && building_level > 0)
      return (
        (building_placeholder.alcohols_cost *
          (building_level + 1 * (building_level + 1) * (2 * (building_level + 1)))) /
        5
      );
    return building_placeholder.alcohols_cost;
  },
  calculateProductionRate(building_level, building_placeholder) {
    return building_placeholder.production_rate * building_level * building_placeholder.coeff;
  },
  calculateCap(building_level) {
    return 10000 + 25000 * building_level + (10000 + ((25000 * building_level) / 100) * 10);
  },
  upgradeBuilding(
    user,
    now,
    building_level,
    building_name,
    timer,
    building_placeholder,
    d_cost,
    w_cost,
    a_cost,
    cb,
  ) {
    let query;
    const next_update_time = new Date(now.getTime() + timer * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    // IF PRODUCE WEAPON OR DRUGS
    if (building_placeholder.production_rate > 0) {
      const old_rate = building_handler.calculateProductionRate(
        building_level,
        building_placeholder,
      );
      const new_production_rate = building_handler.calculateProductionRate(
        building_level + 1,
        building_placeholder,
      );
      // IF PRODUCE WEAPON
      if (building_placeholder.production_type === 'weapon') {
        user.weapon_production_rate = user.weapon_production_rate - old_rate + new_production_rate;
        query = `UPDATE users SET weapon_production_rate=${
          user.weapon_production_rate
        }, drugs_balance=drugs_balance-${d_cost},
        weapons_balance=weapons_balance-${w_cost}, alcohols_balance=alcohols_balance-${a_cost} 
        WHERE username='${
          user.username
        }';INSERT INTO users_buildings (username , building, lvl, next_update) 
                VALUES ('${user.username}','${building_placeholder.id}', 1,'${next_update_time}') 
                ON DUPLICATE KEY UPDATE lvl=lvl+1, next_update='${next_update_time}'`;
      } else if (building_placeholder.production_type === 'drug') {
        user.drug_production_rate = user.drug_production_rate - old_rate + new_production_rate;
        query = `UPDATE users SET drug_production_rate=${
          user.drug_production_rate
        },  drugs_balance=drugs_balance-${d_cost},
        weapons_balance=weapons_balance-${w_cost}, alcohols_balance=alcohols_balance-${a_cost} 
        WHERE username='${
          user.username
        }'; INSERT INTO users_buildings (username , building, lvl, next_update) 
                VALUES ('${user.username}','${building_placeholder.id}',1,'${next_update_time}') 
                ON DUPLICATE KEY UPDATE lvl=lvl+1, next_update='${next_update_time}'`;
      } else if (building_placeholder.production_type === 'alcohol') {
        user.alcohol_production_rate =
          user.alcohol_production_rate - old_rate + new_production_rate;
        query = `UPDATE users SET alcohol_production_rate=${
          user.alcohol_production_rate
        }, drugs_balance=drugs_balance-${d_cost},
        weapons_balance=weapons_balance-${w_cost}, alcohols_balance=alcohols_balance-${a_cost} 
        WHERE username='${
          user.username
        }'; INSERT INTO users_buildings (username , building, lvl, next_update) 
                VALUES ('${user.username}','${building_placeholder.id}', 1,'${next_update_time}') 
                ON DUPLICATE KEY UPDATE lvl=lvl+1, next_update='${next_update_time}'`;
      }
    }
    // IF DOESNT PRODUCE ANYTHING
    else if (
      building_placeholder.id === 'drug_storage' ||
      building_placeholder.id === 'weapon_storage' ||
      building_placeholder.id === 'alcohol_storage'
    ) {
      const newcap = building_handler.calculateCap(building_level + 1);
      query = `UPDATE users SET drugs_balance=drugs_balance-${d_cost},
      weapons_balance=weapons_balance-${w_cost}, alcohols_balance=alcohols_balance-${a_cost},
      ${building_placeholder.id}=${newcap}
      WHERE username='${user.username}';
            INSERT INTO users_buildings (username , building, lvl, next_update) 
            VALUES ('${user.username}','${building_placeholder.id}', 1,'${next_update_time}')
            ON DUPLICATE KEY UPDATE lvl=lvl+1, next_update='${next_update_time}'`;
    } else {
      query = `UPDATE users SET drugs_balance=drugs_balance-${d_cost},
      weapons_balance=weapons_balance-${w_cost}, alcohols_balance=alcohols_balance-${a_cost}  WHERE username='${
        user.username
      }';
            INSERT INTO users_buildings (username , building, lvl, next_update) 
            VALUES ('${user.username}','${building_placeholder.id}', 1,'${next_update_time}')
            ON DUPLICATE KEY UPDATE lvl=lvl+1, next_update='${next_update_time}'`;
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
