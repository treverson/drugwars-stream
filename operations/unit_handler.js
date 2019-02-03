
var db = require('../lib/db');
var player = require('./player_handler')
var utils = require('../utils/utils')
var gamebase = require('../gamebase.json')

var units = []
for (i = 0; i < gamebase.units.length; i++) {
    units.push(gamebase.units[i])
}

const unit_handler = {
    tryAddUnit: function (character, unit_id, unit_amount, amount, cb) {
        var query = "SELECT * FROM character_units WHERE name = ?; \n\
            SELECT * FROM character_buildings WHERE name = ?";
        db.query(query, [character.name,character.name], function (err, [character_units, character_buildings]) {
            if (err) {
                console.log(err)
                cb(null)
            }
            else {
                var now = new Date();
                var current_unit = units.filter(function (item) { return item.id === unit_id; });
                // var current_building = current_building[0]
                console.log(current_unit)
                var training_facility_level = character_buildings[0]['building_3_level']
                if (training_facility_level < 1) {
                    return cb('training facility to low')
                }
                if (character_units['unit_' + unit_id + '_last_update'] != null)
                    var unit_last_update = character_units['unit_' + unit_id + '_last_update']
                else {
                    unit_last_update = now
                }
                //CHECK LAST UPDATE
                if (unit_last_update <= now) {
                    var timer = unit_handler.calculateTime(training_facility_level,unit_amount, current_unit)
                    console.log(timer)
                    var cost = unit_handler.calculateCost(unit_amount, current_unit)
                    console.log(cost)
                    //CHECK DRUGS COST BALANCE
                    if (cost > character.weapons && !amount) {
                        return cb('not enough drugs')
                    }
                    if (cost < character.weapons && !amount) {
                        // unit_handler.confirmBuildingUpdate(character, now, building_level, building_id, timer, current_building, cost, function (result) {
                        //     if (result)
                        //     return cb(result)
                        // })
                        console.log('gonna buy')
                    }
                    if (amount != null) {
                        amount = parseFloat(amount.split(' ')[0]).toFixed(3)
                        utils.costToSteem(cost, function (result) {
                            if (result)
                                if (result <= amount || result - ((result / 100)*5) <= amount )
                                {
                                    cost = 0
                                    timer = 1
                                    unit_handler.confirmBuildingUpdate(character, now, building_level, building_id, timer, current_building, cost, function (result) {
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
    calculateTime: function (training_facility_level,unit_amount, current_unit) {
        return (current_unit.coeff * 100) * (unit_amount ^ 2 / training_facility_level)
    },
    calculateCost: function (unit_amount, current_unit) {
        return (current_unit.base_price * unit_amount)
    },
    confirmAddUnit: function (character, now, building_level, building_id, timer, current_building, cost, cb) {
        var query;
        var next_update_time = new Date(now.getTime() + (timer * 1000)).toISOString().slice(0, 19).replace('T', ' ')
        if (current_building.production_rate > 0) {
            var old_rate = unit_handler.calculateProductionRate(building_level - 1, current_building)
            var production_rate = unit_handler.calculateProductionRate(building_level, current_building)
            if (current_building.production_type === 'weapon') {
                character.weapon_production_rate = (character.weapon_production_rate - old_rate) + production_rate
                character.drugs = character.drugs - cost
                query = "UPDATE `character` SET weapon_production_rate=" + character.weapon_production_rate + ", drugs=" + character.drugs + " WHERE name='" + character.name + "'; \n\
                UPDATE character_buildings SET building_"+ building_id + "_level=" + building_level + ", building_" + building_id + "_last_update='" + next_update_time + "'  WHERE name='" + character.name + "'";
            }
            else {
                character.drug_production_rate = (character.drug_production_rate - old_rate) + production_rate
                character.drugs = character.drugs - cost
                query = "UPDATE `character` SET drug_production_rate=" + character.drug_production_rate + ", drugs=" + character.drugs + "  WHERE name='" + character.name + "'; \n\
                UPDATE character_buildings SET building_"+ building_id + "_level=" + building_level + ", building_" + building_id + "_last_update='" + next_update_time + "'  WHERE name='" + character.name + "'";
            }
        }
        else {
            character.drugs = character.drugs - cost
            query = "UPDATE `character` SET drugs=" + character.drugs + "  WHERE name='" + character.name + "'; \n\
            UPDATE character_buildings SET building_"+ building_id + "_level=" + building_level + ", building_" + building_id + "_last_update='" + next_update_time + "'  WHERE name='" + character.name + "'";
        }
        db.query(query, function (err, result) {
            if (err) {
                console.log(result)
                cb(err);
            }
            else {
                console.log("Upgraded character building :" + building_id + " for : " + character.name)
                cb('success')
            }
        })
    }
}
module.exports = unit_handler;