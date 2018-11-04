var mysql = require('mysql');
var steem = require('steem');

var pool = mysql.createPool({
    connectionLimit: 5,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});

const market_handler = {
    insertItem: function (item, cb) {
        var query = `INSERT INTO ongamemarket (seller,appid,fee,usd_price,name,date,sold) 
          VALUES
              ('${item.seller}','${item.appid}','${item.fee}','${item.usd_price}','${item.name}','${item.date}','0')`
          pool.getConnection(function (error, connection) {
            connection.query(query, function (err, result) {
              if (err) {
                console.log(err)
                cb(err);
                connection.release();
              }
              else
                console.log('item inserted')
              cb(null)
              connection.release();
            })
          })
    }
}
module.exports = market_handler;