var mysql = require('mysql');
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
                        console.log(result[0].date)
                        var lastday = new Date(result[0].date)
                        var dd = today.getDate();
                        var mm = today.getMonth() + 1; //January is 0!
                        var yyyy = today.getFullYear();
                        if (dd < 10) {
                            dd = '0' + dd
                        }
                        if (mm < 10) {
                            mm = '0' + mm
                        }
                        lastday = yyyy + '/' + mm + '/' + dd;

                        var today = new Date(date);
                        var dd = today.getDate();
                        var mm = today.getMonth() + 1; //January is 0!
                        var yyyy = today.getFullYear();
                        if (dd < 10) {
                            dd = '0' + dd
                        }
                        if (mm < 10) {
                            mm = '0' + mm
                        }
                        today = yyyy + '/' + mm + '/' + dd;
                        if(lastday === today){
                            console.log('sameday')
                        }
                        else{
                            console.log('not the sameday')
                        }
                    }

                    else {
                        console.log('no result')
                        var query = "INSERT INTO gift (username, day, date) VALUES ('" + user + "','1','" + date + "')";
                        connection.query(query, function (err, result) {
                            if (err) console.log(error);
                            else {
                                console.log('inserted')
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