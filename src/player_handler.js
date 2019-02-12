const db = require('../helpers/db');

const player_handler = {
  checkIfExist(username, cb) {
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, result) => {
      if (err || !result || !result[0]) {
        console.log(`[player] ${username} doesnt exist`);
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
    const query = `INSERT INTO users (username, drugs_balance, weapons_balance, alcohols_balance, last_update, xp, picture, referrer ) VALUES ('${player}', 2500, 5000, 5000,'${now}', 1, ${icon},'${referrer}'); \n\
      INSERT INTO users_buildings (username,building,next_update,lvl) VALUES ('${player}','headquarters','${now}',1); \n\
      INSERT INTO users_buildings (username,building,next_update,lvl) VALUES ('${player}','crackhouse','${now}',1); \n\
      INSERT INTO users_buildings (username,building,next_update,lvl) VALUES ('${player}','ammunition','${now}',1); \n\
      INSERT INTO users_buildings (username,building,next_update,lvl) VALUES ('${player}','t_distillery','${now}',1);`;
    db.query(query, (err, result) => {
      if (err || !result || !result[0]) {
        console.log(`[player] coudlnt create a character for username ${player}${err}`);
        return cb(true);
      }
      console.log(`[player] User : ${player} is now ready to play`);
      cb(null);
    });
  },
  addXp(name, xp, cb) {
    const query = `UPDATE users SET xp=xp+${xp} WHERE username='${name}'`;
    db.query(query, (err, result) => {
      if (err) {
        console.log(`[player] coudlnt add xp for ${name}`);
        return cb(true);
      }
      console.log(`[player] ${xp}XP added to user ${name}`);
      cb(true);
    });
  },
  getUpdateCharacter(username, cb) {
    let query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, result) => {
      if (err || !result || !result[0] || result[0] === null) {
        console.log('[player]', err);
        cb(null);
      } else {
        const user = result[0];
        query = 'SELECT * FROM users_buildings WHERE username = ?';
        db.query(query, [user.username], (err, result) => {
          if (err) {
            console.error('[player]', err);
            cb(null);
          } else {
            const buildings = JSON.parse(JSON.stringify(result));
            const now = new Date();
            const nowtomysql = new Date()
              .toISOString()
              .slice(0, 19)
              .replace('T', ' ');
            console.log(
              `[player] User ${user.username} old drug balance : ${
                user.drugs_balance
              } old weapon balance : ${user.weapons_balance} old alcohol balance : ${
                user.alcohols_balance
              }`,
            );
            const differenceprod = now.getTime() - user.last_update.getTime();
            let drugs_balance =
              user.drugs_balance +
              Number(parseFloat((differenceprod / 1000) * user.drug_production_rate).toFixed(2));
            let alcohols_balance =
              user.alcohols_balance +
              Number(parseFloat((differenceprod / 1000) * user.alcohol_production_rate).toFixed(2));
            let weapons_balance =
              user.weapons_balance +
              Number(parseFloat((differenceprod / 1000) * user.weapon_production_rate).toFixed(0));
            const d_cap = player_handler.calculateCap(buildings, 'drug_storage');
            const w_cap = player_handler.calculateCap(buildings, 'weapon_storage');
            const a_cap = player_handler.calculateCap(buildings, 'alcohol_storage');

            if (buildings.filter(item => item.building === 'operation_center')[0]) {
              const operation_center = buildings.filter(
                item => item.building === 'operation_center',
              )[0];
              drugs_balance += drugs_balance * (operation_center.lvl * 0.005);
              weapons_balance += weapons_balance * (operation_center.lvl * 0.005);
              alcohols_balance += alcohols_balance * (operation_center.lvl * 0.005);
              console.log(`[player] applied bonus %${operation_center.lvl * 0.005}`);
            }
            if (drugs_balance > d_cap) drugs_balance = d_cap;
            if (weapons_balance > w_cap) weapons_balance = w_cap;
            if (alcohols_balance > a_cap) alcohols_balance = a_cap;
            const query = `UPDATE users SET drugs_balance=${drugs_balance}, weapons_balance=${weapons_balance}, alcohols_balance=${alcohols_balance}, last_update='${nowtomysql}' WHERE username='${username}'`;
            db.query(query, (err, result) => {
              if (err) console.error('[player]', err);
              else {
                user.drugs_balance = drugs_balance;
                user.weapons_balance = weapons_balance;
                user.alcohols_balance = alcohols_balance;
                console.log(
                  `[player] user - Updated user ${
                    user.username
                  } new drug balance : ${drugs_balance} new weapon balance : ${weapons_balance} new alcohol balance : ${alcohols_balance}`,
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
          console.error('[player]', err);
          cb(null);
        } else {
          const [[buildings], [heist]] = result;
          cb({ character, buildings, heist });
        }
      });
    });
  },
  calculateCap(buildings, type) {
    if (buildings.filter(item => item.building === type)[0]) {
      const building = buildings.filter(item => item.building === type)[0];
      return 10000 + 25000 * +building.lvl + (10000 + ((25000 * +building.lvl) / 100) * 10);
    }

    return 10000;
  },
  removeDrugs(username, amount, cb) {
    const query = `UPDATE users SET drugs_balance=drugs_balance-${amount} WHERE username='${username}'`;
    db.query(query, (err, result) => {
      if (err) {
        console.error('[player]', err);
        cb(null);
      } else {
        console.log(`[player] Upgraded balance : for : ${username}`);
        cb(true);
      }
    });
  },
  checkArmy(username, army, cb) {
    const query = 'SELECT * FROM users_units WHERE username = ?';
    db.query(query, [username], (err, result) => {
      if (err || !result || !result[0]) {
        console.log(`[player] ${username} doesnt have units`);
        return cb(null);
      }
      for (i = 0; i < army.length; i++) {
        if (result.filter(item => item.unit === army[i].unit)) {
          if (
            result.filter(item => item.unit === army[i].unit).amount <
            parseFloat(army[i].amount).toFixed(0)
          )
            cb(console.log(`[player] no units${army[i].unit}`));
        }
      }
      cb('success');
    });
  },
};

module.exports = player_handler;
