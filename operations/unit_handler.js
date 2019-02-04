
var db = require('../lib/db');
var player = require('./player_handler')
var utils = require('../utils/utils')
var gamedata = require('../gamedata/units.json')
var units = []
for (i = 0; i < gamedata.units.length; i++) {
    units.push(gamedata.units[i])
}

const unit_handler = {
    tryAddUnit: function (user, unit_name, unit_amount, amount, cb) {
        var query = "SELECT * FROM users_units WHERE username = ?; \n\
            SELECT * FROM users_buildings WHERE username = ?";
        db.query(query, [user.username, user.username], function (err, [character_units, character_buildings]) {
            if (err) {
                console.log(err)
                cb(null)
            }
            else {
                //CHOOSE THE PLACEHOLDER
                console.log(unit_name)
                var unit_placeholder = units.filter(function (item) { return item.id === unit_name; })[0]
                var now = new Date();
                //CHECK FOR TRAINING FACILITY
                var training_facility = character_buildings.filter(function (item) { return item.building === "training_facility"})[0]
                if(!training_facility && !training_facility.lvl < 1)
                {
                    return cb('training facility to low')
                }
                if(character_units.filter(function (item) { return item.unit === unit_name; })[0])
                {
                    var unit = character_units.filter(function (item) { return item.unit === unit_name})
                    var next_update = new Date(Date.parse(unit[0].next_update))
                }
                else{
                    var next_update = now
                }
                //CHECK LAST UPDATE
                if (next_update <= now) {
                    var timer = unit_handler.calculateTime(training_facility, unit_amount, unit_placeholder)
                    console.log(timer)
                    var cost = unit_handler.calculateCost(unit_amount, unit_placeholder)
                    console.log(cost)
                    //CHECK WEAPONS COST BALANCE
                    if (cost > user.weapons_balance && !amount) {
                        return cb('not enough weapons')
                    }
                    if (cost < user.weapons_balance && !amount) {
                        unit_handler.AddUnits(user, now, unit_name, unit_amount, timer, cost, function (result) {
                            if (result)
                                return cb(result)
                        })
                    }
                    if (amount != null) {
                        amount = parseFloat(amount.split(' ')[0]).toFixed(3)
                        utils.costToSteem(cost, function (result) {
                            if (result)
                                if (result <= amount || result - ((result / 100) * 5) <= amount) {
                                    cost = 0
                                    timer = 1
                                    unit_handler.AddUnits(user, now, unit_name, unit_amount, timer, cost, function (result) {
                                        if (result)
                                            return cb(result)
                                    })
                                }
                                else return cb('you must send more STEEM the difference was :' + parseFloat(result - amount).toFixed(3) + ' STEEM')
                        })
                    }
                }
                else {
                    return cb('need to wait')
                }


            }
        })
    },
    calculateTime: function (training_facility, unit_amount, unit_placeholder) {
        return (unit_placeholder.coeff * 100) * (unit_amount ^ 2 / training_facility.lvl)
    },
    calculateCost: function (unit_amount, unit_placeholder) {
        return (unit_placeholder.base_price * unit_amount)
    },
    AddUnits: function (user, now, unit_name, unit_amount, timer, cost, cb) {
        var query;
        var next_update_time = new Date(now.getTime() + (timer * 1000)).toISOString().slice(0, 19).replace('T', ' ')
        query = `UPDATE users SET weapons_balance=weapons_balance-${cost} WHERE username='${user.username}'; \n\
            INSERT INTO users_units (username, unit, amount, next_update) VALUES ('${user.username}','${unit_name}',${unit_amount},'${next_update_time}') \n\
            ON DUPLICATE KEY UPDATE amount=amount+${unit_amount}, next_update='${next_update_time}'`
        db.query(query, function (err, result) {
            if (err) {
                console.log(result)
                cb(err);
            }
            else {
                console.log("Addd " + unit_amount + " units :" + unit_name + " for : " + user.username)
                cb('success')
            }
        })
    }
}
module.exports = unit_handler;