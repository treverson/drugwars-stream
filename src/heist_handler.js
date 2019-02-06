const db = require('../helpers/db');
const player = require('./player_handler');

const heist_handler = {
  addToPool(user, amount, cb) {
    const now = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    const query = `INSERT INTO heist (username, drugs, last_update) VALUES ('${
      user.username
    }', ${amount},'${now}')
        ON DUPLICATE KEY UPDATE drugs=drugs+${amount}, last_update='${now}'`;
    db.query(query, (err, result) => {
      if (err) {
        return cb(null);
      }
      player.removeDrugs(user.username, amount, success => {
        if (success) cb(true);
      });
    });
  },
};

module.exports = heist_handler;
