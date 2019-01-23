var mysql        = require('mysql');
var dbConnection   = mysql.createConnection({
  supportBigNumbers: true,
  bigNumberStrings: true,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  connectionLimit : 10,               // this is the max number of connections before your pool1 starts waiting for a release
  multipleStatements : true   
});

module.exports = dbConnection;
