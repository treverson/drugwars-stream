const battle_handler = {
    checkForABattle: function (player_id,cb) {
        if (battle_id > 0) {
            JoinBattle(player_id, battle_id, function (error) {
                if (error)
                    console.log(error)
            })
        }
    },
    JoinBattle:function (player_id, battle_id, cb) {
        pool.getConnection(function (err, connection) {
            var query = "UPDATE battle SET battle_player_two_id=" + player_id + " WHERE battle_id=" + battle_id
            connection.query(query, function (err, result) {
                if (err) cb(true);
                else {
                    console.log("User : " + player_id + " joined battle " + battle_id)
                    ResolveBattle(battle_id, function (error) {
                        if (error)
                            console.log(error)
                        else {
                            connection.release();
                            console.log("Battle " + battle_id + " solved")
                            cb(null)
                        }
                    })
    
                }
            })
        })
    }
}



module.exports = battle_handler;