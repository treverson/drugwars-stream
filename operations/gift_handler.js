var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 5,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});

const gift_handler = {
    createNewGift : function (json, cb) {
        //INSERT USER 
        var user = json.name
        var date = json.date
        console.log("User : " + user + " will be verified");
        pool.getConnection(function (err, connection) {
            var query = "SELECT * FROM gift WHERE username='" + user + "'"
            connection.query(query, function (err, result) {
                if (err) console.log(error);
                else {
                    console.log(result)
                    //RECUPERATE USER ACTUAL GIFT
                    connection.release();
                    cb(null)
                }
            })
        })
    }
}
module.exports = gift_handler;