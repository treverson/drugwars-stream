const db = require('../helpers/db');

const attackblocks = [];
const battle = require('./battle_handler');

function resolveAttack(attack) {
    console.log(`revolsing battle ${attack.battle_key}`);
    battle.launchBattle(attack.battle_key);
}


const attack_handler = {
  startAttack: function (username, army, defender, block_num, key, cb) {
      var now = new Date();
      var query = []
      var timer = (1 * 6) * 1 ^ 2 / 1
      var next_update_time = new Date(now.getTime() + (timer * 1000)).toISOString().slice(0, 19).replace('T', ' ')
      var start_block = block_num
      var target_block = block_num + (timer*3)
      var end_block = block_num + ((timer*3)*2)
      console.log('block num : ' + block_num +'target num : ' + target_block)
    //   query.push(`TRUNCATE TABLE battles`)
    //   query.push(`TRUNCATE TABLE battles_units`) 

      query.push(`INSERT INTO battles (username, defender, next_update, battle_key, target_block,start_block,end_block) 
                  VALUES ('${username}','${defender}','${next_update_time}','${key}',${target_block},${start_block},${end_block})`)
      for(i=0;i<army.length;i++)
      {
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
          var attack ={}
          attack.key = key
          attack.target_block = target_block
          console.log('created battle and moved units from users_units > to battles_units')
          cb(attack)
      })  
  },
  loadAttacks:function(latest_block){
      let query = "SELECT * FROM battles";
      db.query(query, function (err, result) {
          if (err || !result || !result[0]) {
              console.log('no attack to load')
              return
          }
          else {
              console.log(result)
              for(i=0;i<result.length;i++)
              {
                  if(result[i].target_block && result[i].target_block<latest_block)
                  {
                      resolveAttack(result[i])
                  }
                  else{
                      var attack = {battle_key:result[i].battle_key,target_block:result[i].target_block}
                      attackblocks.push(attack)
                  }
              }
          }
      });
  },
  addAttack:function(key,target_block){
      var attack = {battle_key:key,target_block:target_block}
      attackblocks.push(attack)    
  },
  checkAttacks:function(object){
      if(attackblocks.filter(function (item) { return item.target_block < object.block_num}).length>0)
      {
          var attack = attackblocks.filter(function (item) { return item.target_block < object.block_num})
          console.log(attack)
          console.log('resolving fights with target block ' + attack[0].target_block)
          resolveAttack(attack[0])
      }
  }
}

module.exports = attack_handler;