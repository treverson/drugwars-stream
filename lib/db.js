const mysql = require('mysql');

// const db = mysql.createPool({
//   host: process.env.MYSQL_HOST,
//   user: process.env.MYSQL_USERNAME,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DB,
//   connectionLimit: 15,
//   multipleStatements: true,
// });

const db = mysql.createPool({
  host: 'us-cdbr-iron-east-01.cleardb.net',
  user: 'b389ec37a0bd5d',
  password: '4e470bd6',
  database: 'heroku_edae4e0bcfdc848',
  connectionLimit: 15,
  multipleStatements: true,
});

module.exports = db;
