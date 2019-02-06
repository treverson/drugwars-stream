const db = require('../helpers/db');

const attackblocks = [];
const battle = require('./battle_handler');

function resolveAttack(attack) {
  if (attack) {
    console.log(`revolsing battle ${attack.battle_key}`);
    battle.launchBattle(attack.battle_key);
  }
}

const attack_handler = {
  startAttack(username, army, defender, block_num, key, cb) {
    const now = new Date();
    let query = [];
    const timer = (1 * 3 * 1) ^ (2 / 1);
    const next_update_time = new Date(now.getTime() + timer * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    const target_block = block_num + timer * 3;
    console.log(`block num : ${block_num}target num : ${target_block}`);
    query.push(`TRUNCATE TABLE battles`);
    query.push(`TRUNCATE TABLE battles_units`);

    query.push(`INSERT INTO battles (username, defender, next_update, battle_key, target_block) 
                    VALUES ('${username}','${defender}','${next_update_time}','${key}',${target_block})`);
    for (i = 0; i < army.length; i++) {
      query.push(
        `UPDATE users_units SET amount=amount-${army[i].amount} WHERE unit='${
          army[i].unit
        }' AND username='${username}'`,
      );
      query.push(`INSERT INTO battles_units (username, unit, amount, battle_key) 
                        VALUES ('${username}','${army[i].unit}',${army[i].amount},'${key}')`);
    }
    query = query.join(';');
    db.query(query, [username], (err, result) => {
      if (err) {
        console.log(err);
        return cb(null);
      }
      const attack = {};
      attack.key = key;
      attack.target_block = target_block;
      console.log('created battle and moved units from users_units > to battles_units');
      cb(attack);
    });
  },
  loadAttacks(latest_block) {
    const query = 'SELECT * FROM battles';
    db.query(query, (err, result) => {
      if (err || !result || !result[0]) {
        console.log('no attack to load');
      } else if (result.length > 0)
        for (i = 0; i < result.length; i++) {
          if (result[i].target_block && result[i].target_block < latest_block) {
            resolveAttack(result[i]);
          } else {
            const attack = {
              battle_key: result[i].battle_key,
              target_block: result[i].target_block,
            };
            attackblocks.push(attack);
          }
        }
    });
  },
  addAttack(key, target_block) {
    const attack = { battle_key: key, target_block };
    attackblocks.push(attack);
  },
  checkAttacks(object) {
    if (attackblocks.filter(item => item.target_block === object.block_num).length > 0) {
      const attack = attackblocks.filter(item => item.target_block === object.block_num);
      console.log(attack);
      console.log(`resolving fights with target block ${attack.target_block}`);
      resolveAttack(attack);
    }
  },
};

module.exports = attack_handler;
