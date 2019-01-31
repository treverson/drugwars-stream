
var db = require('../lib/db');
var player = require('./player_handler')

const building_handler = {
    AddLevelToBuilding:function (character, building_id, amount, cb) {
            var query = "SELECT * FROM character_buildings WHERE name = ?; \n\
            SELECT * FROM buildings";
            db.query(query, [character.name], function (err, [character_buildings,buildings]) {
                if (err) {
                    console.log(err)
                    cb(null)
                }
                else {
                    var hq_level = character_buildings[0]['building_1_level']
                    var building_level = character_buildings[0]['building_'+building_id+'_level']
                    if(character_buildings[0]['building_'+building_id+'_last_update'])
                    var building_last_update = character_buildings[0]['building_'+building_id+'_last_update']
                    else{
                        var now = new Date();
                        now = new Date(now.toISOString())
                        building_last_update = now
                    }
                    console.log('hq level ' + hq_level)
                    console.log('building level' + building_level)
                    console.log('building last update ' + building_last_update)
                    console.log(buildings)
                    var timer = building_handler.calculateTime()
                    console.log(timer)
                    var cost  = building_handler.calculateCost()


                    var timer = 900;
                    var cost = 100000000;
                    for (i = 0; cbuildings.length > i; i++) {
                        if (cbuildings[i].building_id === building_id) {
                            var type = cbuildings[i].cost_type
                            var ptype = cbuildings[i].production_type
                            var prod_rate;
                            var old_prod_rate;
                            if(cbuildings[i].production_rate > 0)
                            {
                                if(building.level === 0)
                                {
                                 
                                    timer = (cbuildings[i].building_coeff * 400) * 1^2/buildings.building_1_level
                                    var z = (1) * cbuildings[i].building_base_price
                                    cost = (z*((1)*cbuildings[i].building_coeff))
                                    old_prod_rate = 0
                                    prod_rate = (cbuildings[i].production_rate)
                                }
                               
                                else{
                           
                                }
                               
                            }
                            else{
                                if(building.level === 0)
                                {
                                    timer =    (cbuildings[i].building_coeff * 400) * 1^2/buildings.building_1_level
                                    var z = (1) * cbuildings[i].building_base_price
                                    cost = (z*((1)*cbuildings[i].building_coeff))
                                }
                               
                                else{
                                    timer = (cbuildings[i].building_coeff * 400) * ((building.level)^2/buildings.building_1_level)
                                    var z = (building.level+1) * cbuildings[i].building_base_price
                                    cost = (z*((building.level+1)*cbuildings[i].building_coeff))
                                }
                            }
                            if(cost>player.drugs)
                            {
                                return cb('User doesnt have enough drugs')
                            }
                            else{
                                var d = new Date();
                                if(building.last_update< d)
                                {
                                    console.log('next update' + building.last_update)
                                    var nowtomysql =  new Date().toISOString().slice(0, 19).replace('T', ' ')
                                    var query;
                                    if(ptype === 'weapons')
                                    {
                                        if(prod_rate)
                                        player.weapon_production_rate = (player.weapon_production_rate - old_prod_rate) + prod_rate
                                        player.drugs = player.drugs-cost
                                        query = "UPDATE `character` SET weapon_production_rate="+player.weapon_production_rate +", drugs="+player.drugs+" WHERE name='"+player.name+"'"
                                    }
                                    else{
                                        if(prod_rate)
                                        player.drug_production_rate = (player.drug_production_rate - old_prod_rate) + prod_rate
                                        player.drugs = player.drugs-cost
                                        query = "UPDATE `character` SET drug_production_rate="+player.drug_production_rate+", drugs="+player.drugs+"  WHERE name='"+player.name+"'"
                                    }                                
                                    db.query(query, function (err, result) {
                                        if (err) throw err;
                                        else {
                                            var now = new Date(d.getTime() + (timer*1000)).toISOString().slice(0, 19).replace('T', ' ')
                                            var query = `UPDATE character_buildings SET building_${building_id}_level=${Number(building.level+1)}, building_${building_id}_last_update='${now}'  WHERE name='${player.name}'`
                                            db.query(query, function (err, result) {
                                                if (err) cb(err);
                                                else {
                                                    console.log("Upgraded character building :" + building_id +  " for : " + player.name)
                                                    cb('success')
                                                }
                                            })
                                        }
                                    })
                                }
                                else{
                                    cb('need to wait')
                                } 
                            }
                        }
                    }
                }
        })
    },
    calculateTime:function(hq_level,building_id,building_level,buildings,cb){
        console.log(buildings[building_id].building_coeff)
        return (buildings[building_id].building_coeff * 400) * ((building_level)^2/hq_level)

    },
    calculateCost:function(id,level,cb){

    },
    AddLevelToPlayerBuildingSteem:function (player, building_id, amount, cb) {
        // dbConnection.getConnection(function (err, connection) {
        //     var query = `SELECT * FROM character_buildings WHERE name=${player.name}`
        //     connection.query(query, function (err, result) {
        //         if (err) {
        //             console.log(err)
        //             cb(null)
        //         }
        //         else {
        //             var buildings = result[0]
        //             var building ={}
        //             for (var i in buildings) {
        //                 if (i === 'building_' + building_id + '_level')
        //                 {
        //                     if(buildings[i]>0)
        //                     building.level = buildings[i]
        //                     else 
        //                     building.level = 1
        //                 }
        //                 if (i === 'building_' + building_id + '_last_update')
        //                 {
        //                     if(buildings[i])
        //                     building.last_update = buildings[i]
        //                     else{
        //                         building.last_update = new Date()
        //                     }
        //                 }

        //             }
        //             var query = "SELECT * FROM buildings"
        //             connection.query(query, function (err, result) {
        //                 if (err) {
        //                     console.log(error)
        //                     cb(null)
        //                 }
        //                 var cbuildings = result
        //                 var timer = 900;
        //                 var cost = 100000000;
        //                  for (i = 0; cbuildings.length > i; i++) {
        //                     if (cbuildings[i].building_id === building_id) {
        //                         var type = cbuildings[i].cost_type
        //                         var ptype = cbuildings[i].production_type
        //                         var prod_rate;
        //                         var old_prod_rate;
        //                         if(cbuildings[i].production_rate > 0)
        //                         {
        //                             if(building.level === 0)
        //                             {
        //                                 timer =  5 
        //                                 var z = (1) * cbuildings[i].building_base_price
        //                                 cost = (z*((1)*cbuildings[i].building_coeff))
        //                                 old_prod_rate = 0
        //                                 prod_rate = (cbuildings[i].production_rate)
        //                             }
                                   
        //                             else{
        //                                 timer =  5 
        //                                 var z = (building.level+1) * cbuildings[i].building_base_price
        //                                 cost = (z*((building.level+1)*cbuildings[i].building_coeff))
        //                                 prod_rate = (((building.level+1))*cbuildings[i].production_rate)+(((cbuildings[i].production_rate*(100+((building.level+1))))/100))
        //                                 old_prod_rate = ((building.level)*cbuildings[i].production_rate)+(((cbuildings[i].production_rate*(100+(building.level)))/100))
        //                             }
                                   
        //                         }
        //                         else{
        //                             if(building.level === 0)
        //                             {
        //                                 timer = 5
        //                                 var z = (1) * cbuildings[i].building_base_price
        //                                 cost = (z*((1)*cbuildings[i].building_coeff))
        //                             }
                                   
        //                             else{
        //                                 timer =  5
        //                                 var z = (building.level+1) * cbuildings[i].building_base_price
        //                                 cost = (z*((building.level+1)*cbuildings[i].building_coeff))
        //                             }
        //                         }
        //                         if((cost/10000)>amount)
        //                         {
        //                             connection.release()
        //                             return cb('User doesnt have enough Steem')
        //                         }
        //                         else{
        //                             var d = new Date();
        //                             if(building.last_update< d)
        //                             {
        //                                 console.log('next update' + building.last_update)
        //                                 var query;
        //                                 if(ptype === 'weapons')
        //                                 {
        //                                     if(prod_rate)
        //                                     player.weapon_production_rate = player.weapon_production_rate + prod_rate
        //                                     query = "UPDATE `character` SET weapon_production_rate="+player.weapon_production_rate +" WHERE name='"+player.name+"'"
        //                                 }
        //                                 else{
        //                                     if(prod_rate)
        //                                     player.drug_production_rate = player.drug_production_rate + prod_rate
        //                                     query = "UPDATE `character` SET drug_production_rate="+player.drug_production_rate+" WHERE name='"+player.name+"'"
        //                                 }                                
        //                                 connection.query(query, function (err, result) {
        //                                     if (err) throw err;
        //                                     else {
        //                                         var now = new Date(d.getTime() + (timer*1000)).toISOString().slice(0, 19).replace('T', ' ')
        //                                         var query = `UPDATE character_buildings SET building_${building_id}_level=${Number(building.level+1)}, building_${building_id}_last_update='${now}'  WHERE name='${player.name}'`
        //                                         connection.query(query, function (err, result) {
        //                                             if (err) cb(err);
        //                                             else {
        //                                                 console.log("Upgraded character building :" + building_id +  " for : " + player.character_id)
        //                                                 connection.release();
        //                                                 cb('success')
        //                                             }
        //                                         })
        //                                     }
        //                                 })
        //                             }
        //                             else{
        //                                 cb('need to wait')
        //                             } 
        //                         }
        //                     }
        //                 }
                      
                       
        //             })
        //         }
        //     })
        // })

    }
}
module.exports = building_handler;