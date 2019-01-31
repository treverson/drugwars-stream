
var db = require('../lib/db');
var player = require('./player_handler')

const building_handler = {
    AddLevelToBuilding: function (character, building_id, amount, cb) {
        var query = "SELECT * FROM character_buildings WHERE name = ?; \n\
            SELECT * FROM buildings";
        db.query(query, [character.name], function (err, [character_buildings, buildings]) {
            if (err) {
                console.log(err)
                cb(null)
            }
            else {
                var current_building = buildings.filter(function (item) { return item.building_id === building_id; });
                var hq_level = character_buildings[0]['building_1_level']
                var building_level = character_buildings[0]['building_' + building_id + '_level'] + 1
                if (character_buildings[0]['building_' + building_id + '_last_update'])
                    var building_last_update = character_buildings[0]['building_' + building_id + '_last_update']
                else {
                    var now = new Date();
                    now = new Date(now.toISOString())
                    building_last_update = now
                }
                console.log('hq level ' + hq_level)
                console.log('building level ' + building_level)
                console.log('building last update ' + building_last_update)
                var timer = building_handler.calculateTime(hq_level, building_level, current_building)
                console.log(timer)
                var cost = building_handler.calculateCost(hq_level, building_level, current_building)
                console.log(cost)
                if (current_building.production_rate > 0) {
                    var prod_rate = production_rate
                    var prod_type = current_building.production_type
                }




                if (cost > player.drugs) {
                    return cb('User doesnt have enough drugs')
                }
                else {
                    var d = new Date();
                    if (building.last_update < d) {
                        console.log('next update' + building.last_update)
                        var nowtomysql = new Date().toISOString().slice(0, 19).replace('T', ' ')
                        var query;
                        if (ptype === 'weapons') {
                            if (prod_rate)
                                player.weapon_production_rate = (player.weapon_production_rate - old_prod_rate) + prod_rate
                            player.drugs = player.drugs - cost
                            query = "UPDATE `character` SET weapon_production_rate=" + player.weapon_production_rate + ", drugs=" + player.drugs + " WHERE name='" + player.name + "'"
                        }
                        else {
                            if (prod_rate)
                                player.drug_production_rate = (player.drug_production_rate - old_prod_rate) + prod_rate
                            player.drugs = player.drugs - cost
                            query = "UPDATE `character` SET drug_production_rate=" + player.drug_production_rate + ", drugs=" + player.drugs + "  WHERE name='" + player.name + "'"
                        }
                        db.query(query, function (err, result) {
                            if (err) throw err;
                            else {
                                var now = new Date(d.getTime() + (timer * 1000)).toISOString().slice(0, 19).replace('T', ' ')
                                var query = `UPDATE character_buildings SET building_${building_id}_level=${Number(building.level + 1)}, building_${building_id}_last_update='${now}'  WHERE name='${player.name}'`
                                db.query(query, function (err, result) {
                                    if (err) cb(err);
                                    else {
                                        console.log("Upgraded character building :" + building_id + " for : " + player.name)
                                        cb('success')
                                    }
                                })
                            }
                        })
                    }
                    else {
                        cb('need to wait')
                    }
                }


            }
        })
    },
    calculateTime: function (hq_level, building_level, current_building) {
        return (current_building.building_coeff * 400) * ((building_level) ^ 2 / hq_level)

    },
    calculateCost: function (hq_level, building_level, current_building) {
        return (current_building.building_base_price * ((building_level) * current_building.building_coeff))
    },

}
module.exports = building_handler;