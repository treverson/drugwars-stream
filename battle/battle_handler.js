var mysql = require('mysql');

const battle_handler={}

battle_handler.CreateBattle = function() {
    console.log('Battle Created !');
}

battle_handler.StartBattle = function() {
    console.log('Battle Started !');
}

module.exports = battle_handler;