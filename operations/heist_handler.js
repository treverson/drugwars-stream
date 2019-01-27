
var dbConnection = require('../lib/dbconn');

const heist_handler = {
    addToPool: function (player, amount, cb) {
        dbConnection.getConnection(function (err, connection) {
            var now = new Date().toISOString().slice(0, 19).replace('T', ' ')
            var query = `INSERT INTO heist_pool (user_id, saved_drugs, date) VALUES (${player.character_id}, ${amount},'${now}')
            ON DUPLICATE KEY UPDATE saved_drugs= saved_drugs +${amount}, date='${now}'`
            connection.query(query, function (err, result) {
                if (err) cb(err);
                else {
                    console.log("Upgraded heist invest : for : " + player.character_id)
                    connection.release();
                    cb('success')
                }
            })
        })
    }
}
module.exports = heist_handler;