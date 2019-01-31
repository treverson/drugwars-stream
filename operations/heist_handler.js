
var db = require('../lib/db');

const heist_handler = {
    addToPool: function (player, amount, cb) {
        var now = new Date().toISOString().slice(0, 19).replace('T', ' ')
        var query = `INSERT INTO heist_pool (user_id,name, saved_drugs, date) VALUES (${player.character_id},'${player.name}', ${amount},'${now}')
        ON DUPLICATE KEY UPDATE saved_drugs= saved_drugs +${amount}, date='${now}'`
        db.query(query, function (err, result) {
            if (err || !result || !result[0])
            {
                return cb(null);
            }
            else {
                player.drugs = player.drugs-amount
                query = "UPDATE `character` SET drugs="+player.drugs+" WHERE name='"+player.name +"'"
                connection.query(query, function (err, result) {
                    if (err) throw err;
                    else {
                        console.log("Upgraded heist invest : for : " + player.character_id)
                        connection.release();
                        cb('success')
                    }
                })
            }
        });
    }
}
module.exports = heist_handler;