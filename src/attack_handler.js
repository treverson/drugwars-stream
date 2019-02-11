const db = require('../helpers/db');
const battle = require('./battle_handler');

const attack_handler = {
    resolveBattle: (attack) => new Promise((resolve, reject) => {
      console.log(`Launching battle @${attack.username} VS @${attack.defender} #${attack.battle_key}`);
      battle.launchBattle(attack.battle_key, (result) => {
        if (result) {
          console.log('Finished battle', attack.battle_key);
          resolve();
        } else {
          reject();
        }
      })
    }),
    startAttack: function (username, army, defender, block_num, key, cb) {
        var now = new Date();
        var query = []
        var timer = (1 * 6) * 1 ^ 2 / 1
        var next_update_time = new Date(now.getTime() + (timer * 1000)).toISOString().slice(0, 19).replace('T', ' ')
        var start_block = block_num
        var target_block = block_num + (timer * 3)
        var end_block = block_num + ((timer * 3) * 2)
        console.log('block num : ' + block_num + 'target num : ' + target_block)
        query.push(`INSERT INTO battles (username, defender, next_update, battle_key, target_block,start_block,end_block) 
                  VALUES ('${username}','${defender}','${next_update_time}','${key}',${target_block},${start_block},${end_block})`)
        for (i = 0; i < army.length; i++) {
            query.push(`UPDATE users_units SET amount=amount-${army[i].amount} WHERE unit='${army[i].unit}' AND username='${username}'`)
            query.push(`INSERT INTO battles_units (username, unit, amount, battle_key) 
                      VALUES ('${username}','${army[i].unit}',${army[i].amount},'${key}')`)
        }
        query = query.join(';')
        db.query(query, [username], function (err, result) {
            if (err) {
                console.log(err)
                return cb(null);
            }
            var attack = {}
            attack.key = key
            attack.target_block = target_block
            console.log('created battle and moved units from users_units > to battles_units')
            cb(attack)
        })
    },
}

module.exports = attack_handler;
