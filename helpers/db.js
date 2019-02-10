const mysql = require('mysql');

const db = mysql.createPool({
  host: process.env.PROD_MYSQL_HOST,
  user: process.env.PROD_MYSQL_USERNAME,
  password: process.env.PROD_MYSQL_PASSWORD,
  database: process.env.PROD_MYSQL_DB,
  connectionLimit: 50,
  multipleStatements: true,
})

module.exports = db;
