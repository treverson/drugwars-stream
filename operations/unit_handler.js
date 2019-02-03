
var db = require('../lib/db');
var player = require('./player_handler')
var utils = require('../utils/utils')
const units = []
var fs = require('fs');
fs.readFile('../gamebase.json', 'utf8', function(err, result) {
    console.log(result);
    if (result == 'success') {
        var units = file.units
        for (i = 0; i < units.length; i++) {
            Units.push(units[i])
        }
    }
});

// $.get('../gamebase.json', function(file, result) {
//     if (result == 'success') {
//         var units = file.units
//         for (i = 0; i < units.length; i++) {
//             Units.push(units[i])
//         }
// }})


const unit_handler = {
    tryAddUnit: function (character, unit_id, unit_amount, amount, cb) {
        var query = "SELECT * FROM character_units WHERE name = ?; \n\
            SELECT * FROM units ;\n\
            SELECT * FROM character_buildings WHERE name = ? ;\n\ ";
        db.query(query, [character.name], function (err, [character_units, units, character_buildings]) {
            if (err) {
                console.log(err)
                cb(null)
            }
            else {
                console.log(units)
                console.log(character_units, units,character_buildings)
                //return cb('need to wait')
                // var now = new Date();
                var current_unit = buildings.filter(function (item) { return item.unit_id === unit_id; });
                // var current_building = current_building[0]
                var training_facility_level = character_buildings[0]['building_3_level']
                if (training_facility_level < building_level && building_id !=1) {
                    return cb('hq level to low')
                }
                return cb('need to wait')
                // var building_level = character_buildings[0]['building_' + building_id + '_level'] + 1
                // //CHECK HEADQUARTER LEVEL

                // if (character_buildings[0]['building_' + building_id + '_last_update'] != null)
                //     var building_last_update = character_buildings[0]['building_' + building_id + '_last_update']
                // else {
                //     building_last_update = now
                // }
                // //CHECK LAST UPDATE
                // if (building_last_update <= now) {
                //     var timer = unit_handler.calculateTime(hq_level, building_level, current_building)
                //     console.log(timer)
                //     var cost = unit_handler.calculateCost(building_level, current_building)
                //     //CHECK DRUGS COST BALANCE
                //     if (cost > character.drugs && !amount) {
                //         return cb('not enough drugs')
                //     }
                //     if (cost < character.drugs && !amount) {
                //         unit_handler.confirmBuildingUpdate(character, now, building_level, building_id, timer, current_building, cost, function (result) {
                //             if (result)
                //             return cb(result)
                //         })
                //     }
                //     if (amount != null) {
                //         amount = parseFloat(amount.split(' ')[0]).toFixed(3)
                //         utils.costToSteem(cost, function (result) {
                //             if (result)
                //                 if (result <= amount || result - ((result / 100)*5) <= amount )
                //                 {
                //                     cost = 0
                //                     timer = 1
                //                     unit_handler.confirmBuildingUpdate(character, now, building_level, building_id, timer, current_building, cost, function (result) {
                //                         if (result)
                //                         return cb(result)
                //                     })
                //                 }
                //                     else return cb('you must send more STEEM the difference was :' + parseFloat(result - amount).toFixed(3) + ' STEEM' )
                //         })
                //     }
                // }
                // else {
                //     return cb('need to wait')
                // }


            }
        })
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