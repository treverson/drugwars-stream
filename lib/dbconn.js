var mysql        = require('mysql');
var dbConnection   = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  connectionLimit : 15,   
});

module.exports = dbConnection;
