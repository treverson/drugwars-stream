const prefixJson = require('./prefix.json');

const mysql = require('mysql');
const player = require('./player_handler');

const pool = mysql.createPool({
  connectionLimit: 5,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
});

function getQueryForNewItem(shop_item, newitemid) {
  let prefix = prefixJson;
  const item_quality = SetItemQuality();
  console.log(item_quality);
  let item_name;
  let requirel_level = shop_item.item_required_level;
  let item_durability = shop_item.item_durability;
  let damage = shop_item.item_damage;
  let armor = shop_item.item_armor;
  switch (item_quality) {
    case 1:
      prefix =
        prefix.weapon_quality_prefix.epic[
          Math.floor(Math.random() * prefix.weapon_quality_prefix.epic.length)
        ];
      item_name = `${prefix} ${shop_item.item_name}`;
      requirel_level += 5;
      item_durability *= 5;
      break;
    case 2:
      prefix =
        prefix.weapon_quality_prefix.legendary[
          Math.floor(Math.random() * prefix.weapon_quality_prefix.legendary.length)
        ];
      item_name = `${prefix} ${shop_item.item_name}`;
      requirel_level += 4;
      item_durability *= 4;
      break;
    case 3:
      prefix =
        prefix.weapon_quality_prefix.rare[
          Math.floor(Math.random() * prefix.weapon_quality_prefix.rare.length)
        ];
      item_name = `${prefix} ${shop_item.item_name}`;
      requirel_level += 3;
      item_durability *= 3;
      break;
    case 4:
      prefix =
        prefix.weapon_quality_prefix.magic[
          Math.floor(Math.random() * prefix.weapon_quality_prefix.magic.length)
        ];
      item_name = `${prefix} ${shop_item.item_name}`;
      requirel_level += 2;
      item_durability *= 2;
      break;
    default:
      prefix =
        prefix.weapon_quality_prefix.normal[
          Math.floor(Math.random() * prefix.weapon_quality_prefix.normal.length)
        ];
      item_name = `${prefix} ${shop_item.item_name}`;
  }

  switch (shop_item.item_type_id) {
    case 1:
      damage = CreateWeapon(damage, item_quality);
      break;
    case 2:
      armor = CreateArmor(armor, item_quality);
      break;
    case 3:
      damage = CreateWeapon(damage, item_quality);
      armor = CreateArmor(armor, item_quality);
      break;
    case 4:
      break;
    default:
  }
  const query = `INSERT INTO item (item_ref, item_type_id, item_name, item_required_level, item_durability, item_quality, item_damage, item_armor) VALUES (${newitemid},${
    shop_item.item_type_id
  },'${item_name}',${requirel_level},${item_durability},${item_quality}, ${damage},${armor})`;
  return query;
}

function SetItemQuality() {
  let rnd = 0;
  rnd = getRandomInt(100);
  console.log(`quality ${rnd}`);
  if (rnd > 99) {
    return 1;
  }
  if (rnd > 95) {
    return 2;
  }
  if (rnd > 87) {
    return 3;
  }
  if (rnd > 71) {
    return 4;
  }

  return 5;
}

function CreateWeapon(damage, item_quality) {
  return (damage = (damage * 7) / item_quality);
}

function CreateArmor(armor, item_quality) {
  return (armor = (armor * 7) / item_quality);
}

function CreateAccessories(damage, item_quality) {}

function CreateAttribute(item_quality) {}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
createUniqueId = function() {
  const id = new Date().valueOf();
  return id;
};
const shop_handler = {
  StartTransaction(transaction, cb) {
    const username = transaction.from;
    const amount = transaction.amount.split(' ')[0];
    let id;
    if (transaction.memo != undefined) {
      const item = transaction.memo.split('-')[1];
      console.log(`Username : ${username} Amount : ${amount} Memo : ${item}`);
      pool.getConnection((err, connection) => {
        const query = `SELECT * FROM user WHERE username='${username}'`;
        connection.query(query, (err, result) => {
          if (err) throw err;
          if (result[0] != undefined) {
            id = result[0].user_id;
            const query = `SELECT * FROM shop WHERE item_id='${item}'`;
            connection.query(query, (err, result) => {
              if (err) throw err;
              else {
                console.log(`Item price = ${result[0].item_price}Amount  = ${amount}`);
                if (result[0].item_price <= amount) {
                  let item_ref = 0;
                  item_ref = createUniqueId();
                  const query = getQueryForNewItem(result[0], item_ref);
                  connection.query(query, (err, result) => {
                    if (err) throw err;
                    else {
                      console.log('Item successfully created');
                      const query = `SELECT * FROM item WHERE item_ref='${item_ref}'`;
                      connection.query(query, (err, result) => {
                        if (err) throw err;
                        else {
                          console.log(
                            `Item ${
                              result[0].item_id
                            } with reference ${item_ref} successfully added to ${id}`,
                          );
                          const query = `INSERT INTO character_item (character_id, item_id) VALUES (${id},${
                            result[0].item_id
                          })`;
                          connection.query(query, (err, result) => {
                            if (err) throw err;
                            else {
                              console.log(`Item ${item_ref} move to ${id}`);
                              player.addXpToCharacter(id, 10, result => {
                                if (result) {
                                  connection.release();
                                  cb(null);
                                } else {
                                  connection.release();
                                  cb(true);
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                } else {
                  console.log('not enough money');
                  connection.release();
                  cb(true);
                }
              }
            });
          }
        });
      });
    } else {
      console.log('cannt read memo');
      console.log(transaction.memo);
    }
  },
};
module.exports = shop_handler;
