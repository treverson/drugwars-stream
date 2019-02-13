const io = require('socket.io-client');
const db = require('../helpers/db');
const round = require('./battles/round_handler');
const secondRound = require('./battles/second_round_handler');
const player = require('./player_handler')
const socket = new io.connect('https://websocket-drugwars.herokuapp.com/');

const launchBattle = (battle_key, cb) => {
  const query = `SELECT * FROM battles WHERE battle_key = ? ;
      SELECT * FROM battles_units WHERE battle_key = ?`;
  db.query(query, [battle_key, battle_key], (err, attacker_result) => {
    if (err || !attacker_result || !attacker_result[0]) {
      console.err('[battle]', err);
    }
    let [[battle], units] = attacker_result;
    const attacker = {};
    attacker.username = battle.username;
    console.log('[battle]', JSON.stringify(battle));
    units = JSON.parse(JSON.stringify(units));
    attacker.units = [];
    for (i = 0; i < units.length; i++) {
      if (units[i].amount >= 1) {
        attacker.units.push(units[i]);
      }
    }
    if (attacker.units.length > 0) {
      const query = `SELECT * FROM users_buildings WHERE username = ? ;
                  SELECT * FROM users_units WHERE username = ?;
                  SELECT * FROM users WHERE username = ?`;
      db.query(
        query,
        [battle.defender, battle.defender, battle.defender],
        (err, defender_result) => {
          if (err) {
            console.error('[battle]', err);
          }
          let [buildings, def_units, defender_account] = defender_result;
          const defender = {};
          defender.username = battle.defender;

          def_units = JSON.parse(JSON.stringify(def_units));
          buildings = JSON.parse(JSON.stringify(buildings));
          defender.units = [];
          // defender.buildings = [];
          // for (i = 0; i < buildings.length; i++) {
          //   defender.buildings.push(buildings[i]);
          // }
          for (i = 0; i < def_units.length; i++) {
            defender.units.push(def_units[i]);
          }
          player.getUpdateCharacter(defender.username, character => {
            if (character) {
              const d_cap = defender_account[0].drug_storage / 100 * 10
              const w_cap = defender_account[0].weapon_storage / 100 * 10
              const a_cap = defender_account[0].alcohol_storage / 100 * 10
              let d_reward = 0
              let w_reward = 0
              let a_reward = 0
              if (defender_account[0].drugs_balance - d_cap > 0)
                d_reward = defender_account[0].drugs_balance - d_cap
              if (defender_account[0].weapons_balance - w_cap > 0)
                w_reward = defender_account[0].weapons_balance - w_cap
              if (defender_account[0].alcohols_balance - a_cap > 0)
                a_reward = defender_account[0].alcohols_balance - a_cap
              if (defender.units.length > 0) {
                console.error('[battle - defender units]', def_units)
                secondRound.continueBattle(
                  attacker.units,
                  defender.units,
                  (user_attacker, user_defender, rc) => {
                    const now = new Date()
                      .toISOString()
                      .slice(0, 19)
                      .replace('T', ' ');
                    let query = [];
                    if (user_attacker.length > 0) {
                      for (i = 0; i < user_attacker.length; i++) {
                        if (user_attacker[i].amount >= 1)
                          query.push(`UPDATE users_units SET amount=amount+${user_attacker[i].amount} WHERE unit ='${user_attacker[i].unit}' AND username = '${attacker.username}'`);
                      }
                      if (!user_defender || user_defender.length < 1) {
                        query.push(
                          `UPDATE users SET xp=xp+50, drugs_balance=drugs_balance+${d_reward}, weapons_balance=weapons_balance+${w_reward},alcohols_balance=alcohols_balance+${a_reward}, 
                          wins=wins+1 WHERE username='${attacker.username}'`);
                      }
                    }
                    if (user_defender.length > 0) {
                      for (i = 0; i < user_defender.length; i++) {
                        if (user_defender[i].amount && user_defender[i].amount > 0)
                          query.push(
                            `UPDATE users_units SET amount=${user_defender[i].amount} WHERE unit='${
                            user_defender[i].unit
                            }' AND username = '${defender.username}'`,
                          );
                      }
                    } else {
                      query.push(`DELETE FROM users_units WHERE username = '${defender.username}'`);
                      if (user_attacker.length > 0) {
                        query.push(
                          `UPDATE users SET last_update='${now}', xp=xp+1, drugs_balance=drugs_balance-${d_reward}, weapons_balance=weapons_balance-${w_reward},alcohols_balance=alcohols_balance-${a_reward}, loses=loses+1 WHERE username = '${defender.username}'`);
                      }
                    }
                    rc.attacker = attacker.username
                    rc.attacker_pic = attacker.picture
                    rc.attacker_units = attacker.units
                    rc.defender = defender.username
                    rc.defender_pic = defender.picture
                    rc.defender_units = defender.units
                    rc.rewards = { drugs: d_reward, weapons: w_reward, alcohol: a_reward }
                    query.push(`DELETE FROM battles_units WHERE username ='${attacker.username}' AND battle_key = '${battle_key}'`);
                    query.push(`DELETE FROM battles WHERE battle_key = '${battle_key}'`);
                    query.push(`INSERT INTO battles_history (username, defender, json, date, battle_key) 
                                VALUES ('${attacker.username}','${defender.username}','${JSON.stringify(rc)}','${now}','${battle_key}')`);
                    query = query.join(' ; ');
                    db.query(query, (err, result) => {
                      if (err) {
                        console.error('[battle]', err);
                        cb(false);
                      } else {
                        console.error('[battle]',  `defender lost units total reward drugs ${d_reward}, weapons ${w_reward},alcohol ${a_reward},`);

                        //socket.emit('attackresult', attacker.username, rc);
                        //socket.emit('attackresult', defender.username, rc);
                        cb(true);
                      }
                    });
                  },
                );
              }
              else {
                let query = []
                const now = new Date()
                  .toISOString()
                  .slice(0, 19)
                  .replace('T', ' ');
                for (i = 0; i < attacker.units.length; i++) {
                  if (attacker.units[i].amount >= 1)
                    query.push(`UPDATE users_units SET amount=amount+${attacker.units[i].amount} WHERE unit ='${attacker.units[i].unit}' AND username = '${attacker.username}'`);
                }
                query.push(
                  `UPDATE users SET xp=xp+25, drugs_balance=drugs_balance+${d_reward}, weapons_balance=weapons_balance+${w_reward},alcohols_balance=alcohols_balance+${a_reward}, 
                  wins=wins+1 WHERE username='${attacker.username}'`);
                query.push(
                  `UPDATE users SET xp=xp+1, last_update='${now}', drugs_balance=drugs_balance-${d_reward}, weapons_balance=weapons_balance-${w_reward},alcohols_balance=alcohols_balance-${a_reward}, loses=loses+1 WHERE username = '${defender.username}'`);
                let rc = {}
                rc.attacker = attacker.username
                rc.attacker_pic = attacker.picture
                rc.attacker_units = attacker.units
                rc.defender = defender.username
                rc.defender_pic = defender.picture
                rc.rewards = { drugs: d_reward, weapons: w_reward, alcohol: a_reward }
                query.push(
                  `DELETE FROM battles_units WHERE username ='${
                  attacker.username
                  }' AND battle_key = '${battle_key}'`,
                );
                query.push(`DELETE FROM battles WHERE battle_key = '${battle_key}'`);
                query.push(`INSERT INTO battles_history (username, defender, json, date, battle_key) 
                                    VALUES ('${attacker.username}','${defender.username}','${JSON.stringify(rc)}','${now}','${battle_key}')`);
                query = query.join(' ; ');
                db.query(query, (err, result) => {
                  if (err) {
                    console.error('[battle]', err);
                    cb(false);
                  } else
                    console.error('[battle]',  `defender had no units total reward drugs ${d_reward}, weapons ${w_reward},alcohol ${a_reward},`);

                    //socket.emit('attackresult', attacker.username, rc);
                    //socket.emit('attackresult', defender.username, rc);
                  cb(true);
                });
              }
            }
            else {
              console.error('[battle - defender units]', 'couldnt upgrade player state for ' + defender.username)
              cb(false);
            }
          })
        })
    }
    else {
      console.error('[battle] attacker have no units');
      const query = `DELETE FROM battles_units WHERE username ='${attacker.username}' AND battle_key = '${battle_key}'; 
                     DELETE FROM battles WHERE battle_key = '${battle_key}'`
      db.query(query, (err, result) => {
        if (err) {
          console.error('[battle]', err);
          cb(false);
        } else
          console.error('[battle]', ' attacked had no units');
        cb(true);
      });
    }
  });
};

module.exports = {
  launchBattle,
};
