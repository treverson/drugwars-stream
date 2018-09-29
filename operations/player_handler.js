const express = require('express');
var mysql = require('mysql');

const player_handler={}

player_handler.CreateBattle = function() {
    console.log('Battle Created !');
}

player_handler.StartBattle = function() {
    console.log('Battle Started !');
}

module.exports = player_handler;