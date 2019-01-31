
var db = require('../lib/db');
var player = require('./player_handler')

const heist_handler = {
    addToPool: function (character, amount, cb) {
        var now = new Date().toISOString().slice(0, 19).replace('T', ' ')
        var query = `INSERT INTO heist_pool (user_id,name, saved_drugs, date) VALUES (${character.character_id},'${character.name}', ${amount},'${now}')
        ON DUPLICATE KEY UPDATE saved_drugs= saved_drugs +${amount}, date='${now}'`
        db.query(query, function (err, result) {
            if (err)
            {
                return cb(null);
            }
            else {
                player.removeDrugs(amount,function(succes){
                    if(success)
                    cb(true)
                })
            }
        });
    }
}
module.exports = heist_handler;