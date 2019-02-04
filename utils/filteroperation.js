var battle = require('../operations/battle_handler')
var player = require('../operations/player_handler')
var shop = require('../operations/shop_handler')
var building = require('../operations/building_handler')
var unit = require('../operations/unit_handler')
var heist = require('../operations/heist_handler')
var pool = require('../operations/pool_handler')
const io = require('socket.io-client');
var socket = new io.connect('https://websocket-drugwars.herokuapp.com/');


const bc_operation = {
    filter: function (tx) {
        if (tx.operations[0][0] === "custom_json" && tx.operations[0][1].id === "dw-attack") {
            try {
                var op = JSON.parse(tx.operations[0][1].json)
            } catch (error) {
                console.log(error)
            }
            console.log(tx.block_num)
            player.checkIfExist(op.username, function (exist) {
                if (exist && op.defender) {
                    player.checkIfExist(op.defender, function (exist) {
                        if (exist)
                            player.checkArmy(op.username, op.army, function (result) {
                                if (result === 'success') {
                                    console.log('enough units')
                                    battle.startAttack(op.username, op.army, op.defender, tx.block_num, tx.id, function (attack) {
                                        if (attack) {
                                            battle.addAttack(attack.key,attack.target_block)
                                            socket.emit('refresh', op.username)
                                            socket.emit('receiving_attack', op.defender)
                                        }
                                        else {
                                            console.log("couldnt start attack")
                                        }
                                    })
                                }
                                else {
                                    console.log('couldnt start attack not enough units')
                                }
                            })
                        else {
                            console.log('defender doesnt exist')
                        }
                    })
                }
                else {
                    console.log('users doesnt exist')
                }
            })
        }

        if (tx.operations[0][0] === "custom_json" && tx.operations[0][1].id === "dw-char") {
            try {
                var op = JSON.parse(tx.operations[0][1].json)
            } catch (error) {
                console.log(error)
            }
            player.checkIfExist(op.username, function (exist) {
                if (!exist) {
                    player.createNew(op.username, op.icon, op.referrer, function (error) {
                        if (error) {
                            console.log("couldnt create charachter")
                        }
                        else {
                            socket.emit('refresh', op.username)
                        }
                    })
                }
            })
        }
        if (tx.operations[0][0] === "custom_json" && tx.operations[0][1].id === "dw-upgrade") {
            try {
                var op = JSON.parse(tx.operations[0][1].json)
            } catch (error) {
                console.log(error)
            }
            player.getUpdateCharacter(op.username, function (character) {
                if (character)
                    building.tryUpdateBuilding(character, op.building, null, function (result) {
                        if (result === "success") {
                            player.addXp(op.username, 5, function (result) {
                                if (result)
                                    socket.emit('refresh', op.username)
                            })
                        }
                        else console.log(result)

                    })
            })
        }
        if (tx.operations[0][0] === "custom_json" && tx.operations[0][1].id === "dw-unit") {
            try {
                var op = JSON.parse(tx.operations[0][1].json)
            } catch (error) {
                console.log(error)
            }
            player.getUpdateCharacter(op.username, function (character) {
                if (character) {
                    if (!op.unit || !op.unit_amount || op.unit_amount < 1) {
                        var reason = "cant buy 0 unit"
                        pool.refund(op, reason, function (result) {
                            if (result)
                                console.log(result)
                        })
                    }
                    unit.tryAddUnit(character, op.unit, op.unit_amount, null, function (result) {
                        if (result === "success") {
                            player.addXp(op.username, 5, function (result) {
                                if (result)
                                    socket.emit('refresh', op.username)
                            })
                        }
                        else console.log(result)

                    })
                }
            })
        }
        if (tx.operations[0][0] === "custom_json" && tx.operations[0][1].id === "dw-heist") {
            try {
                var op = JSON.parse(tx.operations[0][1].json)
            } catch (error) {
                console.log(error)
            }
            player.getUpdateCharacter(op.username, function (character) {
                if (character) {
                    if (character.drugs_balance >= op.amount)
                        heist.addToPool(character, Number(op.amount), function (result) {
                            if (result)
                                console.log(result)
                            socket.emit('refresh', op.username)
                        })
                    else {
                        console.log('not enough drugs to deposit to heist')
                    }
                }
            })
        }
        if (tx.operations[0][0] === "transfer" && tx.operations[0][1].to === "drugwars-dealer") {
            var op = tx.operations[0][1]
            player.getUpdateCharacter(op.from, function (character) {
                if (character) {
                    building_id = op.memo.split(':')[1]
                    //console.log(op)
                    if (op.memo.split(':')[0] === "upgrade") {
                        building.tryUpdateBuilding(character, building_id, op.amount, function (result) {
                            if (result === "success") {
                                player.addXp(op.from, 5, function (result) {
                                    if (result)
                                        socket.emit('refresh', op.username)
                                })
                                console.log(result)
                                socket.emit('refresh', op.from)
                                pool.send(op, function (result) {
                                    if (result)
                                        console.log(result)
                                })
                            } else {
                                var reason = "couldnt not upgrade building " + result
                                pool.refund(op, reason, function (result) {
                                    if (result)
                                        console.log(result)
                                })
                            }
                        })
                    }
                    else if (op.memo.split(':')[0] === "unit") {
                        op.unit = op.memo.split(',')[0].split(':')[1]
                        if (op.memo.split(',')[1].split(':')[1])
                            op.unit_amount = Number(op.memo.split(',')[1].split(':')[1])
                        if (!op.unit || !op.unit_amount || op.unit_amount < 1) {
                            var reason = "cant buy 0 unit"
                            pool.refund(op, reason, function (result) {
                                if (result)
                                    console.log(result)
                            })
                        }
                        else
                            unit.tryAddUnit(character, op.unit, op.unit_amount, op.amount, function (result) {
                                if (result === "success") {
                                    player.addXp(op.from, 5, function (result) {
                                        if (result)
                                            socket.emit('refresh', op.username)
                                    })
                                    console.log(result)
                                    socket.emit('refresh', op.from)
                                    pool.send(op, function (result) {
                                        if (result)
                                            console.log(result)
                                    })
                                } else {
                                    var reason = "couldnt not create unit " + result
                                    pool.refund(op, reason, function (result) {
                                        if (result)
                                            console.log(result)
                                    })
                                }
                            })
                    }
                    else {
                        var reason = "feature not enabled "
                        pool.refund(op, reason, function (result) {
                            if (result)
                                console.log(result)
                        })
                    }
                } else {
                    var reason = "character doesnt exist "
                    pool.refund(op, reason, function (result) {
                        if (result)
                            console.log(result)
                    })
                }
            })
        }
    }
}



module.exports = bc_operation;