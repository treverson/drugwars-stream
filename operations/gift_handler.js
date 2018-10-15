var mysql = require('mysql');
var steem = require('steem');
var pool = mysql.createPool({
    connectionLimit: 5,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});

const gift_handler = {
    createNewGift: function (json, cb) {
        //INSERT USER 
        var user = json.name
        var date = json.date
        console.log("User : " + user + " will be verified");
        pool.getConnection(function (err, connection) {
            var query = "SELECT * FROM gift WHERE username='" + user + "'"
            connection.query(query, function (err, result) {
                if (err) console.log(error);
                else {
                    //RECUPERATE USER ACTUAL GIFT
                    if (result.length >= 1) {
                        //CHECK IF ITS ALREADY 6 DAY AND RESET GIFT
                        var lastday = new Date(result[0].date)
                        var zz = lastday.getDate();
                        var ff = lastday.getMonth() + 1; //January is 0!
                        var tttt = lastday.getFullYear();
                        if (zz < 10) {
                            zz = '0' + zz
                        }
                        if (ff < 10) {
                            ff = '0' + ff
                        }
                        lastday = tttt + '/' + ff + '/' + zz;

                        var today = new Date().toISOString().slice(0, 19).replace('T', ' ');
                        console.log(today)
                        // var dd = today.getDate();
                        // var mm = today.getMonth() + 1; //January is 0!
                        // var yyyy = today.getFullYear();
                        // today = yyyy + '/' + mm + '/' + dd;
                        // if (dd < 10) {
                        //     dd = '0' + dd
                        // }
                        // if (mm < 10) {
                        //     mm = '0' + mm
                        // }
                        // today = yyyy + '/' + mm + '/' + dd;
                        if (lastday === today) {
                            console.log('same day for ' + user)
                            connection.release();
                            return cb(null)
                        }

                        if (result[0].day > 6) {
                            if (lastday === today) {
                                console.log('same day for ' + user)
                                connection.release();
                                cb(null)
                            }
                            else {
                                console.log("reseting days")
                                var query = "UPDATE gift SET day=1 , date='" + today + "' WHERE username='" + user + "'"
                                connection.query(query, function (err, result) {
                                    if (err) throw err;
                                    else {
                                        console.log("Days reset for user" + user)
                                        connection.release();
                                        cb(null)
                                    }
                                })
                            }
                        }
                        else {
                            var newday = parseFloat(result[0].day + 1)
                            console.log('updating days')
                            console.log(result[0])
                            var query = "UPDATE gift SET day=" + newday + ", date='" + today + "' WHERE gift_id=" + result[0].gift_id
                            connection.query(query, function (err, result) {
                                if (err) throw err;
                                else {
                                    steem.broadcast.transfer(process.env.STEEM_PASS, 'fundition.help', user, '0.001 STEEM', 'Reward', function (err, result) {
                                        console.log(err, result);
                                    });
                                    console.log("Day added to user" + user)
                                    cb(null)
                                }
                            })
                        }
                    }
                    else {
                        var today = new Date();
                        var dd = today.getDate();
                        var mm = today.getMonth() + 1; //January is 0!
                        var yyyy = today.getFullYear();
                        today = yyyy + '/' + mm + '/' + dd;
                        console.log('no result')
                        var query = "INSERT INTO gift (username, day, date) VALUES ('" + user + "','1','" + today + "')";
                        connection.query(query, function (err, result) {
                            if (err) console.log(err);
                            else {
                                console.log('inserted')
                                steem.broadcast.transfer(process.env.STEEM_PASS, 'fundition.help', user, '0.001 STEEM', 'Reward', function (err, result) {
                                    console.log(err, result);
                                });
                                connection.release();
                                cb(null)
                            }
                        })
                    }

                }
            })
        })
    }
}
module.exports = gift_handler;


// if (zz + 1 != dd) {
//     console.log("day are different")
//     var query = "UPDATE gift SET day=1 , date='" + today + "' WHERE username='" + user + "'"
//     connection.query(query, function (err, result) {
//         if (err) throw err;
//         else {
//             console.log("Days reset for user" + user)
//             connection.release();
//             return cb(null)
//         }
//     })
// }