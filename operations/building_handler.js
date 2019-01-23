
var dbConnection = require('../lib/dbconn');


const building_handler = {
    AddLevelToPlayerBuilding:function (character_id, building_id, cb) {
        dbConnection.getConnection(function (err, connection) {
            var query = `SELECT * FROM character_buildings WHERE character_id=${character_id}`
            connection.query(query, function (err, result) {
                if (err) {
                    console.log(error)
                    cb(null)
                }
                else {
                    var buildings = result[0]
                    var building ={}
                    for (var i in buildings) {
                        if (i === 'building_' + building_id + '_level')
                        {
                            building.level = buildings[i]
                        }
                        else{
                            building.level = 1
                        }
                        if (i === 'building_' + building_id + '_last_update')
                        {
                            building.last_update = buildings[i]
                        }
                        else{
                            building.last_update = new Date()
                        }
                    }
                    console.log(building)  
                    var query = "SELECT * FROM buildings"
                    connection.query(query, function (err, result) {
                        if (err) {
                            console.log(error)
                            cb(null)
                        }
                        var buildings = result
                        var timer = 900;
                        if(building.level<1)
                        building.level=1
                        for (i = 0; buildings.length > i; i++) {
                            if (buildings[i].building_id === building_id) {
                                timer =  15 * (building.level * buildings[i].building_coeff)
                            }
                        }
                        if(building.last_update>now)
                        {
                            console.log('brooo')
                        }
                        connection.release()
                        cb(true)
                    })
                }
            })
        })

    },
    checkForBuildingTime: function (id, level, cb) {
        dbConnection.getConnection(function (err, connection) {
            var query = "SELECT * FROM buildings"
            connection.query(query, function (err, result) {
                if (err) {
                    console.log(error)
                    cb(null)
                }
                var buildings = result
                if(level<1)
                level=1
                for (i = 0; buildings.length > i; i++) {
                    if (buildings[i].building_id === id) {
                        connection.release()
                        cb(15 * (level * buildings[i].building_coeff))
                    }
                }
            })
        })
    },
    checkPlayerBuildingLevel: function (character_id, building_id, cb) {
       
    },
}
module.exports = building_handler;