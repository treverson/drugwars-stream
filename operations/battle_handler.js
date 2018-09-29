const express = require('express');
var mysql = require('mysql');

const battle_handler={
    createBattle : function(aa) {
        console.log('Battle Created !'+aa);
    }
}



battle_handler.StartBattle = function() {
    console.log('Battle Started !');
}

module.exports = battle_handler;