
var db = require('../lib/db');
var player = require('./player_handler')
var utils = require('../utils/utils')
const building_handler = {
    updateBuilding: function (character, building_id, amount, cb) {
        var query = "SELECT * FROM character_buildings WHERE name = ?; \n\
            SELECT * FROM buildings";
        db.query(query, [character.name], function (err, [character_buildings, buildings]) {
            if (err) {
                console.log(err)
                cb(null)
            }
            else {
                var now = new Date();
                var current_building = buildings.filter(function (item) { return item.building_id === building_id; });
                var current_building = current_building[0]
                var hq_level = character_buildings[0]['building_1_level']
                var building_level = character_buildings[0]['building_' + building_id + '_level'] + 1
                //CHECK HEADQUARTER LEVEL
                if (hq_level < building_level) {
                    cb('hq level to low')
                }
                if (character_buildings[0]['building_' + building_id + '_last_update'] != null)
                    var building_last_update = character_buildings[0]['building_' + building_id + '_last_update']
                else {
                    building_last_update = now
                }
                //CHECK LAST UPDATE
                if (building_last_update <= now) {
                    var timer = building_handler.calculateTime(hq_level, building_level, current_building)
                    console.log(timer)
                    var cost = building_handler.calculateCost(building_level, current_building)
                    //CHECK DRUGS COST BALANCE
                    if (cost > character.drugs && !amount) {
                        return cb('not enough drugs')
                    }
                    if (cost < character.drugs && !amount) {
                        building_handler.confirmBuildingUpdate(character, now, building_level, building_id, timer, current_building, cost, function (result) {
                            if (result)
                            cb(result)
                        })
                    }
                    if (amount != null) {
                        amount = amount.split(' ')[0]
                        utils.costToSteem(cost, function (result) {
                            if (result)
                                if (result < (amount - (amount * 5 / 100)))
                                {
                                    cost = 0
                                    timer = 1
                                    building_handler.confirmBuildingUpdate(character, now, building_level, building_id, timer, current_building, cost, function (result) {
                                        if (result)
                                            cb(result)
                                    })
                                }
                                    else cb('you must send more STEEM the difference was :' + parseFloat(result - amount).toFixed(3) + ' STEEM' )
                        })
                    }
                }
                else {
                    cb('need to wait')
                }


            }
        })
    },
    calculateTime: function (hq_level, building_level, current_building) {
        return (current_building.building_coeff * 400) * (building_level ^ 2 / hq_level)
    },
    calculateCost: function (building_level, current_building) {
        return (current_building.building_base_price * (building_level * current_building.building_coeff))
    },
    calculateProductionRate: function (building_level, current_building) {
        return (current_building.production_rate * (building_level * current_building.building_coeff))
    },
    confirmBuildingUpdate: function (character, now, building_level, building_id, timer, current_building, cost, cb) {
        var query;
        var next_update_time = new Date(now.getTime() + (timer * 1000)).toISOString().slice(0, 19).replace('T', ' ')
        if (current_building.production_rate > 0) {
            var old_rate = building_handler.calculateProductionRate(building_level - 1, current_building)
            var production_rate = building_handler.calculateProductionRate(building_level, current_building)
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
module.exports = building_handler;