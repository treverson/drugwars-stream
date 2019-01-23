
var dbConnection = require('../lib/dbconn');


const building_handler = {
    checkForBuildingTime: function (id, level, cb) {
        dbConnection.getConnection(function (err, connection) {
        var query = "SELECT * FROM buildings"
        connection.query(query, function (err, result) {
            if (err) {
                console.log(error)
                 cb(null)
            }
            var buildings = result
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
        dbConnection.getConnection(function (err, connection) {
            var query = `SELECT * FROM character_buildings WHERE character_id=${character_id}`
            connection.query(query, function (err, result) {
                if (err) {
                    console.log(error)
                     cb(null)
                }
                else {
                    var buildings = result
                    for (i = 0; buildings.length > i; i++) {
                        for (var j in buildings[i]) {
                            if (j = 'building_' + building_id + '_level')
                                cb(buildings[i][j])
                        }
                    }
                }
            })
        })
    },
}
module.exports = building_handler;