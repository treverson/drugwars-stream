const db = require('../helpers/db');

const player_handler = {
  checkIfExist(username, cb) {
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, result) => {
      if (err || !result || !result[0]) {
        console.log(`${username} doesnt exist`);
        return cb(null);
      }
      cb(true);
    });
  },
  createNew(player, icon, referrer, cb) {
    const now = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    const query = `INSERT INTO users (username, drugs_balance, drug_production_rate, weapons_balance, weapon_production_rate, last_update, xp, picture, referrer ) VALUES ('${player}', 1000, 0.20, 1000, 0.20,'${now}', 1, ${icon},'${referrer}'); \n\
                     INSERT INTO users_buildings (username,building,next_update,lvl) VALUES ('${player}','headquarters','${now}',1); \n\
                     INSERT INTO users_buildings (username,building,next_update,lvl) VALUES ('${player}','crackhouse','${now}',1); \n\
                     INSERT INTO users_buildings (username,building,next_update,lvl) VALUES ('${player}','ammunition','${now}',1); \n\
                     `;
    db.query(query, (err, result) => {
      if (err || !result || !result[0]) {
        console.log(`coudlnt create a character for username ${player}${err}`);
        return cb(true);
      }
      console.log(`User : ${player} is now ready to play`);
      cb(null);
    });
  },
  addXp(name, xp, cb) {
    console.log(name);
    const query = `UPDATE users SET xp= xp+${xp} WHERE username='${name}'`;
    db.query(query, (err, result) => {
      if (err) {
        console.log(`coudlnt add xp for ${name}`);
        return cb(true);
      }
      console.log(`${xp}XP added to character${name}`);
      cb(true);
    });
  },
  getUpdateCharacter(username, cb) {
    let query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, result) => {
      if (err || !result || !result[0] || result[0] === null) {
        console.log(err);
        cb(null);
      } else {
        const user = result[0];
        query = 'SELECT * FROM users_buildings WHERE username = ?';
        db.query(query, [user.username], (err, result) => {
          if (err) {
            console.log(err);
            cb(null);
          } else {
            const buildings = JSON.parse(JSON.stringify(result));
            const now = new Date();
            const nowtomysql = new Date()
              .toISOString()
              .slice(0, 19)
              .replace('T', ' ');
              console.log(user.drugs_balance)
            const differenceprod = now.getTime() - user.last_update.getTime();
            let drugs_balance =
              user.drugs_balance +
              Number(parseFloat((differenceprod / 1000) * user.drug_production_rate).toFixed(2));
            let weapons_balance =
              user.weapons_balance +
              Number(parseFloat((differenceprod / 1000) * user.weapon_production_rate).toFixed(0));
            if (buildings.filter(item => item.building === 'operation_center')[0]) {
              const operation_center = buildings.filter(
                item => item.building === 'operation_center',
              )[0];
              drugs_balance = drugs_balance * (operation_center.lvl * 0.005);
              weapons_balance = weapons_balance * (operation_center.lvl * 0.005);
              console.log(`applied bonus %${operation_center.lvl * 0.005}`);
            }
            console.log(user.drugs_balance)
            const query = `UPDATE users SET drugs_balance=${drugs_balance}, weapons_balance=${weapons_balance}, last_update='${nowtomysql}' WHERE username='${username}'`;
            db.query(query, (err, result) => {
              if (err) throw err;
              else {
                user.drugs = drugs_balance;
                user.weapons = weapons_balance;
                console.log(
                  `user - Updated user ${
                    user.username
                  } new drug balance : ${drugs_balance}new weapon balance : ${weapons_balance}`,
                );
                cb(user);
              }
            });
          }
        });
      }
    });
  },
  getCharacter(username, cb) {
    let query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, result) => {
      if (err || !result || !result[0]) return cb(null);
      const character = result[0];
      query =
        'SELECT * FROM users_buildings WHERE username = ?; \n\
          SELECT * FROM heist WHERE username = ?';
      db.query(query, [character.username, character.username], (err, result) => {
        if (err) {
          console.log(err);
          cb(null);
        } else {
          const [[buildings], [heist]] = result;
          cb({ character, buildings, heist });
        }
      });
    });
  },
  removeDrugs(username, amount, cb) {
    const query = `UPDATE users SET drugs_balance=drugs_balance-${amount} WHERE username='${username}'`;
    db.query(query, (err, result) => {
      if (err) {
        console.log(err);
        cb(null);
      } else {
        console.log(`Upgraded balance : for : ${username}`);
        cb(true);
      }
    });
  },
  checkArmy(username, army, cb) {
    const query = 'SELECT * FROM users_units WHERE username = ?';
    db.query(query, [username], (err, result) => {
      if (err || !result || !result[0]) {
        console.log(`${username} doesnt have units`);
        return cb(null);
      }
      for (i = 0; i < army.length; i++) {
        if (result.filter(item => item.unit === army[i].unit)) {
          if (
            result.filter(item => item.unit === army[i].unit).amount <
            parseFloat(army[i].amount).toFixed(0)
          )
            cb(console.log(`no units${army[i].unit}`));
        }
      }
      cb('success');
    });
  },
};
module.exports = player_handler;
