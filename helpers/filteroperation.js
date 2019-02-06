const io = require('socket.io-client');
const attack = require('../src/attack_handler');
const player = require('../src/player_handler');
const shop = require('../src/shop_handler');
const building = require('../src/building_handler');
const unit = require('../src/unit_handler');
const heist = require('../src/heist_handler');
const pool = require('../src/pool_handler');

const socket = new io.connect('https://websocket-drugwars.herokuapp.com/');

const bc_operation = {
  filter(tx) {
    if (tx.operations[0][0] === 'custom_json' && tx.operations[0][1].id === 'dw-attack') {
      try {
        var op = JSON.parse(tx.operations[0][1].json);
      } catch (error) {
        console.log(error);
      }
      player.checkIfExist(op.username, exist => {
        if (exist && op.defender) {
          player.checkIfExist(op.defender, exist => {
            if (exist)
              player.checkArmy(op.username, op.army, result => {
                if (result === 'success') {
                  console.log('enough units');
                  attack.startAttack(
                    op.username,
                    op.army,
                    op.defender,
                    tx.block_num,
                    tx.transaction_id,
                    result => {
                      if (result) {
                        attack.addAttack(result.key, result.target_block);
                        socket.emit('refresh', op.username,op.defender);
                        socket.emit('attack', op.username,op.defender);
                        socket.emit('receiving_attack', op.defender, op.username);
                      } else {
                        console.log('couldnt start attack');
                      }
                    },
                  );
                } else {
                  console.log('couldnt start attack not enough units');
                }
              });
            else {
              console.log('defender doesnt exist');
            }
          });
        } else {
          console.log('users doesnt exist');
        }
      });
    }

    if (tx.operations[0][0] === 'custom_json' && tx.operations[0][1].id === 'dw-char') {
      try {
        var op = JSON.parse(tx.operations[0][1].json);
      } catch (error) {
        console.log(error);
      }
      player.checkIfExist(op.username, exist => {
        if (!exist) {
          player.createNew(op.username, op.icon, op.referrer, error => {
            if (error) {
              console.log('couldnt create charachter');
            } else {
              socket.emit('refresh', op.username);
            }
          });
        }
      });
    }
    if (tx.operations[0][0] === 'custom_json' && tx.operations[0][1].id === 'dw-upgrade') {
      try {
        var op = JSON.parse(tx.operations[0][1].json);
      } catch (error) {
        console.log(error);
      }
      player.getUpdateCharacter(op.username, character => {
        if (character)
          building.tryUpdateBuilding(character, op.building, null, result => {
            if (result === 'success') {
              player.addXp(op.username, 5, result => {
                if (result) socket.emit('refresh', op.username);
              });
            } else console.log(result);
          });
      });
    }
    if (tx.operations[0][0] === 'custom_json' && tx.operations[0][1].id === 'dw-unit') {
      try {
        var op = JSON.parse(tx.operations[0][1].json);
      } catch (error) {
        console.log(error);
      }
      player.getUpdateCharacter(op.username, character => {
        if (character) {
          if (!op.unit || !op.unit_amount || op.unit_amount < 1) {
            const reason = 'cant buy 0 unit';
            pool.refund(op, reason, result => {
              if (result) console.log(result);
            });
          }
          unit.tryAddUnit(character, op.unit, op.unit_amount, null, result => {
            if (result === 'success') {
              player.addXp(op.username, 5, result => {
                if (result) socket.emit('refresh', op.username);
              });
            } else console.log(result);
          });
        }
      });
    }
    if (tx.operations[0][0] === 'custom_json' && tx.operations[0][1].id === 'dw-heist') {
      try {
        var op = JSON.parse(tx.operations[0][1].json);
      } catch (error) {
        console.log(error);
      }
      player.getUpdateCharacter(op.username, character => {
        if (character) {
          if (character.drugs_balance >= op.amount)
            heist.addToPool(character, Number(op.amount), result => {
              if (result) console.log(result);
              socket.emit('refresh', op.username);
            });
          else {
            console.log('not enough drugs to deposit to heist');
          }
        }
      });
    }
    if (tx.operations[0][0] === 'transfer' && tx.operations[0][1].to === 'drugwars-dealer') {
      var op = tx.operations[0][1];
      player.getUpdateCharacter(op.from, character => {
        if (character) {
          building_id = op.memo.split(':')[1];
          // console.log(op)
          if (op.memo.split(':')[0] === 'upgrade') {
            building.tryUpdateBuilding(character, building_id, op.amount, result => {
              if (result === 'success') {
                player.addXp(op.from, 5, result => {
                  if (result) socket.emit('refresh', op.username);
                });
                console.log(result);
                socket.emit('refresh', op.from);
                pool.send(op, result => {
                  if (result) console.log(result);
                });
              } else {
                const reason = `couldnt not upgrade building ${result}`;
                pool.refund(op, reason, result => {
                  if (result) console.log(result);
                });
              }
            });
          } else if (op.memo.split(':')[0] === 'unit') {
            op.unit = op.memo.split(',')[0].split(':')[1];
            if (op.memo.split(',')[1].split(':')[1])
              op.unit_amount = Number(op.memo.split(',')[1].split(':')[1]);
            if (!op.unit || !op.unit_amount || op.unit_amount < 1) {
              var reason = 'cant buy 0 unit';
              pool.refund(op, reason, result => {
                if (result) console.log(result);
              });
            } else
              unit.tryAddUnit(character, op.unit, op.unit_amount, op.amount, result => {
                if (result === 'success') {
                  player.addXp(op.from, 5, result => {
                    if (result) socket.emit('refresh', op.username);
                  });
                  console.log(result);
                  socket.emit('refresh', op.from);
                  pool.send(op, result => {
                    if (result) console.log(result);
                  });
                } else {
                  const reason = `couldnt not create unit ${result}`;
                  pool.refund(op, reason, result => {
                    if (result) console.log(result);
                  });
                }
              });
          } else {
            var reason = 'feature not enabled ';
            pool.refund(op, reason, result => {
              if (result) console.log(result);
            });
          }
        } else {
          var reason = 'character doesnt exist ';
          pool.refund(op, reason, result => {
            if (result) console.log(result);
          });
        }
      });
    }
  },
};

module.exports = bc_operation;
