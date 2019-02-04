
var db = require('../lib/db');
var player = require('./player_handler')

const heist_handler = {
    addToPool: function (user, amount, cb) {
        var now = new Date().toISOString().slice(0, 19).replace('T', ' ')
        var query = `INSERT INTO heist (username, drugs, last_update) VALUES ('${user.username}', ${amount},'${now}')
        ON DUPLICATE KEY UPDATE drugs=drugs+${amount}, last_update='${now}'`
        db.query(query, function (err, result) {
            if (err)
            {
                return cb(null);
            }
            else {
                player.removeDrugs(user.username,amount ,function(succes){
                    if(success)
                    cb(true)
                })
            }
        });
    }
}
module.exports = heist_handler;