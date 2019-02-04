var db = require('../lib/db');
var attackblocks = []
const battle_handler = {
    startAttack: function (username, army, defender, block_num, key, cb) {
        var now = new Date();
        var query = []
        var timer = (1 * 400) * 1 ^ 2 / 1
        var next_update_time = new Date(now.getTime() + (timer * 1000)).toISOString().slice(0, 19).replace('T', ' ')
        var target_block = block_num + (timer/3)
        query.push(`INSERT INTO battles (username, defender, next_update, battle_key, target_block) 
                    VALUES ('${username}','${defender}','${next_update_time}','${key}',${target_block})`)
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
    loadAttacks:function(){
        let query = "SELECT * FROM battles";
        db.query(query, function (err, result) {
            if (err || !result || !result[0]) {
                console.log('no attack to load')
                return
            }
            else {
                for(i=0;i<result.length;i++)
                {
                    var attack = {key:result[i].battle_key,target_block:result[i].target_block}
                    attackblocks.push(attack)
                }
            }
        });
        console.log(attackblocks)
    },
    addAttack:function(key,target_block){
        var attack = {key:key,target_block:target_block}
        attackblocks.push(attack)
    },
    checkAttacks:function(block_num){
       // console.log(block_num)
        console.log(attackblocks)
    },
    resolveAttack:function(){

    }
}

module.exports = battle_handler;