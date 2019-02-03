
var db = require('../lib/db');
var player = require('./player_handler')
var utils = require('../utils/utils')
var gamebase = require('../gamebase.json')

var buildings = []
for (i = 0; i < gamebase.buildings.length; i++) {
    buildings.push(gamebase.buildings[i])
}

const building_handler = {
    updateBuilding: function (character, building_id, amount, cb) {
        var query = "SELECT * FROM buildings WHERE username = ?"
        db.query(query, [character.username], function (err, character_buildings) {
            if (err) {
                console.log(err)
                cb(null)
            }
            else {
                var now = new Date();
                var character_buildings = JSON.parse(JSON.stringify(character_buildings))
                var building_placeholder = buildings.filter(function (item) { return item.id === building_id; })[0]

                var hq_level = character_buildings.filter(function (item) { return item.name === "headquarters"; });
                var crack = character_buildings.filter(function (item) { return item.name === "crackhouse"; });
                if(character_buildings.filter(function (item) { return item.name === building_id; }))
                var current_building = character_buildings.filter(function (item) { return item.name === building_id; })
                else{
                    current_building = "brraa"
                }

                console.log(building_placeholder,current_building,hq_level,crack[0].name)
                var building_level = building_placeholder.level + 1
                //CHECK HEADQUARTER LEVEL
                if (hq_level < building_placeholder.level && building_id != "headquarters") {
                    return cb('hq level to low')
                }
                if (building_placeholder.next_update != null)
                    var next_update = building_placeholder.next_update
                else {
                    next_update = now
                }
                //CHECK LAST UPDATE
                if (next_update <= now) {
                    var timer = building_handler.calculateTime(hq_level, building_level, building_placeholder)
                    console.log(timer)
                    var cost = building_handler.calculateCost(building_level, building_placeholder)
                    //CHECK DRUGS COST BALANCE
                    if (cost > character.drugs && !amount) {
                        return cb('not enough drugs')
                    }
                    if (cost < character.drugs && !amount) {
                        building_handler.confirmBuildingUpdate(character, now, building_level, building_id, timer, building_placeholder, cost, function (result) {
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
                                    building_handler.confirmBuildingUpdate(character, now, building_level, building_id, timer, building_placeholder, cost, function (result) {
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
    calculateProductionRate: function (building_level, building_placeholder) {
        return (building_placeholder.production_rate * (building_level * building_placeholder.coeff))
    },
    calculateAttack: function (building_level, building_placeholder) {
        return (building_placeholder.production_rate * (building_level * building_placeholder.coeff))
    },
    confirmBuildingUpdate: function (character, now, building_level, building_id, timer, building_placeholder, cost, cb) {
        var query;
        var next_update_time = new Date(now.getTime() + (timer * 1000)).toISOString().slice(0, 19).replace('T', ' ')
        if (building_placeholder.production_rate > 0) {
            var old_rate = building_handler.calculateProductionRate(building_level - 1, building_placeholder)
            var production_rate = building_handler.calculateProductionRate(building_level, building_placeholder)
            if (building_placeholder.production_type === 'weapon') {
                character.weapon_production_rate = (character.weapon_production_rate - old_rate) + production_rate
                character.drugs = character.drugs - cost
                query = "UPDATE `character` SET weapon_production_rate=" + character.weapon_production_rate + ", drugs=" + character.drugs + " WHERE name='" + character + "'; \n\
                UPDATE character_buildings SET building_"+ building_id + "_level=" + building_level + ", building_" + building_id + "_last_update='" + next_update_time + "'  WHERE name='" + character + "'";
            }
            else {
                character.drug_production_rate = (character.drug_production_rate - old_rate) + production_rate
                character.drugs = character.drugs - cost
                query = "UPDATE `character` SET drug_production_rate=" + character.drug_production_rate + ", drugs=" + character.drugs + "  WHERE name='" + character + "'; \n\
                UPDATE character_buildings SET building_"+ building_id + "_level=" + building_level + ", building_" + building_id + "_last_update='" + next_update_time + "'  WHERE name='" + character + "'";
            }
        }
        else {
            character.drugs = character.drugs - cost
            query = "UPDATE `character` SET drugs=" + character.drugs + "  WHERE name='" + character + "'; \n\
            UPDATE character_buildings SET building_"+ building_id + "_level=" + building_level + ", building_" + building_id + "_last_update='" + next_update_time + "'  WHERE name='" + character + "'";
        }
        db.query(query, function (err, result) {
            if (err) {
                console.log(result)
                cb(err);
            }
            else {
                console.log("Upgraded character building :" + building_id + " for : " + character)
                cb('success')
            }
        })
    }
}
module.exports = building_handler;