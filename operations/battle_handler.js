const battle_handler = {
    startAttack: function (username, army, defender, block_num,cb) {
        var query = []
        var timer = (1 * 400) * 1 ^ 2 / 1
        var next_update_time = new Date(now.getTime() + (timer * 1000)).toISOString().slice(0, 19).replace('T', ' ')
        var target_block = block_num + (timer/3)
        query.push(`INSERT INTO battles (username, defender, next_update, battle_key, target_block) 
                    VALUES ('${username}','${defender}','${next_update_time}',${block_num},${target_block});`)
        for(i=0;i<army.length;i++)
        {
            query.push(`UPDATE users_units SET amount=amount-${army[i].amount} WHERE unit='${army[i].unit}';`)
            query.push(`INSERT INTO battles_units (username, unit, amount, battle_key) 
                        VALUES ('${username}','${army[i].unit}',${army[i].amount},${block_num});`)
        }
        query = query.join()
        db.query(query, [username], function (err, result) {
            if (err || !result || !result[0]) {
                return cb(console.log(username + ' doesnt have units'));
            }
            console.log('created battle and moved units from users_units > to battles_units')

            cb(null)
        })  
    }
}

module.exports = battle_handler;