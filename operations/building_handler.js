
var db = require('../lib/db');
var player = require('./player_handler')
var utils = require('../utils/utils')
var gamebase = require('../gamebase.json')

var buildings = []
for (i = 0; i < gamebase.buildings.length; i++) {
    buildings.push(gamebase.buildings[i])
}

const building_handler = {
    updateBuilding: function (user, building_name, amount, cb) {
        var query = "SELECT * FROM buildings WHERE username = ?"
        db.query(query, [user.username], function (err, character_buildings) {
            if (err) {
                console.log(err)
                cb(null)
            }
            else {
                //CHOOSE THE PLACEHOLDER
                var building_placeholder = buildings.filter(function (item) { return item.id === building_name; })[0]
                var now = new Date();
                var headquarters = character_buildings.filter(function (item) { return item.name === "headquarters"})[0]
                //CHECK FOR EXISTANT BUILDING AND ADD 1 LEVEL
                var character_buildings = JSON.parse(JSON.stringify(character_buildings))
                if(character_buildings.filter(function (item) { return item.name === building_name; })[0])
                {
                    var building = character_buildings.filter(function (item) { return item.name === building_name})
                    var next_update = building[0].next_update
                    var building_level = building[0].level
                }
                else{
                    var building_level = 0
                    var next_update = now
                }
                building_level+=1
                //CHECK HEADQUARTER LEVEL
                if (headquarters.level < building_level && building_name != headquarters.name) {
                    return cb('hq level to low')
                }
                //CHECK LAST UPDATE
                if (next_update <= now) {
                    var timer = building_handler.calculateTime(headquarters.level, building_level, building_placeholder)
                    console.log(timer)
                    var cost = building_handler.calculateCost(building_level.level, building_placeholder)
                    //CHECK DRUGS COST BALANCE
                    if (cost > user.drugs && !amount) {
                        return cb('not enough drugs')
                    }
                    if (cost < user.drugs && !amount) {
                        building_handler.confirmBuildingUpdate(user, now, building_level, building_name, timer, building_placeholder, cost, function (result) {
                            if (result)
                            return cb(result)
                        })
                    }
                    if (amount != null) {
                        amount = parseFloat(amount.split(' ')[0]).toFixed(3)
                        utils.costToSteem(cost, function (result) {
                            if (result)
                                if (result <= amount || result - ((result / 100)*5) <= amount )
                                {
                                    cost = 0
                                    timer = 1
                                    building_handler.confirmBuildingUpdate(user, now, building_level, building_name, timer, building_placeholder, cost, function (result) {
                                        if (result)
                                        return cb(result)
                                    })
                                }
                                    else return cb('you must send more STEEM the difference was :' + parseFloat(result - amount).toFixed(3) + ' STEEM' )
                        })
                    }
                }
                else {
                    return cb('need to wait')
                }


            }
        })
    },
    calculateTime: function (hq_level, building_level, building_placeholder) {
        return (building_placeholder.coeff * 400) * (building_level ^ 2 / hq_level)
    },
    calculateCost: function (building_level, building_placeholder) {
        return (building_placeholder.base_price * (building_level * building_placeholder.coeff))
    },
    confirmBuildingUpdate: function (user, now, building_level, building_name, timer, building_placeholder, cost, cb) {
        console.log(user, now, building_level, building_name, timer, building_placeholder, cost)
        var query;
        var next_update_time = new Date(now.getTime() + (timer * 1000)).toISOString().slice(0, 19).replace('T', ' ')
        //IF PRODUCE WEAPON OR DRUGS
        if (building_placeholder.production_rate > 0) {
            var old_rate = building_handler.calculateProductionRate(building_level - 1, building_placeholder)
            var production_rate = building_handler.calculateProductionRate(building_level, building_placeholder)
             //IF PRODUCE WEAPON
            if (building_placeholder.production_type === 'weapon') {
                user.weapon_production_rate = (user.weapon_production_rate - old_rate) + production_rate
                user.drugs = user.drugs - cost
                query = `UPDATE users SET weapon_production_rate=${user.weapon_production_rate}, drugs=${user.drugs} WHERE username='${user.username}'; \n\
                INSERT INTO buildings (username , name, level, next_update) VALUES ('${user.username}','${building_placeholder.name}', ${building_level},'${next_update_time}'); \n\
                ON DUPLICATE KEY UPDATE level=${building_level}, next_update='${next_update_time}'`
            }
            else {
                user.drug_production_rate = (user.drug_production_rate - old_rate) + production_rate
                user.drugs = user.drugs - cost
                query = `UPDATE users SET drug_production_rate=${user.drug_production_rate}, drugs=${user.drugs} WHERE username='${user.username}'; \n\
                INSERT INTO buildings (username , name, level, next_update) VALUES ('${user.username}','${building_placeholder.name}', ${building_level},'${next_update_time}'); \n\
                ON DUPLICATE KEY UPDATE level=${building_level}, next_update='${next_update_time}'`
            }
        }
        //IF DOESNT PRODUCE ANYTHING
        else {
            user.drugs = user.drugs - cost
            query = `UPDATE users SET drugs=${user.drugs} WHERE username='${user.username}'; \n\
            INSERT INTO buildings (username , name, level, next_update) VALUES ('${user.username}','${building_placeholder.name}', ${building_level},'${next_update_time}'); \n\
            ON DUPLICATE KEY UPDATE level=${building_level}, next_update='${next_update_time}'`
        }
        db.query(query, function (err, result) {
            if (err) {
                console.log(err)
                cb(err);
            }
            else {
                console.log("Upgraded character building :" + building_name + " for : " + user.username)
                cb('success')
            }
        })
    }
}
module.exports = building_handler;