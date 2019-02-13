const io = require('socket.io-client');
const attack = require('../src/attack_handler');
const player = require('../src/player_handler');
const building = require('../src/building_handler');
const unit = require('../src/unit_handler');
const heist = require('../src/heist_handler');
const pool = require('../src/pool_handler');
const log = require('./discord');

const socket = new io.connect('https://websocket-drugwars.herokuapp.com/');

const handleAttack = (op, tx) => {
  if (op.username !== op.defender) {
    player.checkIfExist(op.username, exist => {
      if (exist && op.defender) {
        player.checkIfExist(op.defender, exist => {
          if (exist)
            player.checkArmy(op.username, op.army, result => {
              if (result === 'success') {
                console.log('[filter attack] enough units');
                attack.startAttack(
                  op.username,
                  op.army,
                  op.defender,
                  tx.block_num,
                  tx.transaction_id,
                  result => {
                    if (result) {
                      // socket.emit('refresh', op.username, op.defender);
                      socket.emit('attack', op.username, op.defender);
                      socket.emit('receiving_attack', op.defender, op.username);
                    } else {
                      console.log('[filter attack] couldnt start attack');
                    }
                  },
                );
              } else {
                console.log('[filter attack] couldnt start attack not enough units');
              }
            });
          else {
            console.log('[filter attack] defender doesnt exist');
          }
        });
      } else {
        console.log('[filter attack] users doesnt exist');
      }
    });
  } else {
    console.log('[filter attack] user cant attack himself');
  }
};

const handleChar = op => {
  player.checkIfExist(op.username, exist => {
    if (!exist) {
      player.createNew(op.username, op.icon, op.referrer, error => {
        if (error) {
          console.log('[filter creation] couldnt create charachter');
        } else {
          socket.emit('refresh', op.username);
        }
      });
    }
  });
};

const handleUpgrade = op => {
  player.getUpdateCharacter(op.username, character => {
    if (character)
      building.tryUpdateBuilding(character, op.building, null, result => {
        if (result === 'success') {
          player.addXp(op.username, 5, result => {
            if (result) socket.emit('refresh', op.username);
          });
        } else console.log('[filter upgrade]', result);
      });
  });
};

const handleUnit = op => {
  player.getUpdateCharacter(op.username, character => {
    if (character) {
      if (!op.unit || !op.unit_amount || op.unit_amount < 1) {
        const reason = 'cant buy 0 unit';
        pool.refund(op, reason, result => {
          if (result) console.log('[filter unit]', result);
        });
      }
      unit.tryAddUnit(character, op.unit, op.unit_amount, null, result => {
        if (result === 'success') {
          player.addXp(op.username, 5, result => {
            if (result) socket.emit('refresh', op.username);
          });
        } else console.log('[filter unit]', result);
      });
    }
  });
};

const handleHeist = payload => {
  if (!payload.username || !payload.amount) return;

  player.getUpdateCharacter(payload.username, character => {
    if (character) {
      if (character.drugs_balance >= payload.amount)
        heist.addToPool(character, Number(payload.amount), result => {
          if (result) {
            console.log('[filter heist]', result);
          } else {
            log(`Failed to add to heist pool ${payload.amount} for @${payload.username}.`);
          }
          socket.emit('refresh', payload.username);
        });
      else {
        console.log('[filter heist] not enough drugs to deposit to heist');
      }
    } else {
      log(`Failed to add to heist pool ${payload.amount} for @${payload.username}.`);
    }
  });
};

const handleTransfer = payload => {
  if (parseFloat(payload.amount) > 50) {
    log(`@${payload.from} just sent ${payload.amount}.`);
  }
  const op = payload;
  player.getUpdateCharacter(op.from, character => {
    if (character) {
      const building_id = op.memo.split(':')[1];
      // console.log(op)
      if (op.memo.split(':')[0] === 'upgrade') {
        building.tryUpdateBuilding(character, building_id, op.amount, result => {
          if (result === 'success') {
            player.addXp(op.from, 5, result => {
              if (result) socket.emit('refresh', op.username);
            });
            console.log('[filter upgrade]', result);
            socket.emit('refresh', op.from);
            pool.send(op, result => {
              if (result) console.log('[filter upgrade]', result);
            });
          } else {
            const reason = `couldnt not upgrade building ${result}`;
            pool.refund(op, reason, result => {
              if (result) console.log('[filter upgrade]', result);
            });
          }
        });
      } else if (op.memo.split(':')[0] === 'unit') {
        op.unit = op.memo.split(',')[0].split(':')[1];
        if (op.memo.split(',')[1].split(':')[1])
          op.unit_amount = Number(op.memo.split(',')[1].split(':')[1]);
        if (!op.unit || !op.unit_amount || op.unit_amount < 1) {
          const reason = 'cant buy 0 unit';
          pool.refund(op, reason, result => {
            if (result) console.log('[filter unit]', result);
          });
        } else
          unit.tryAddUnit(character, op.unit, op.unit_amount, op.amount, result => {
            if (result === 'success') {
              player.addXp(op.from, 5, result => {
                if (result) socket.emit('refresh', op.username);
              });
              console.log('[filter]', result);
              socket.emit('refresh', op.from);
              pool.send(op, result => {
                if (result) console.log('[filter unit]', result);
              });
            } else {
              const reason = `couldnt not create unit ${result}`;
              pool.refund(op, reason, result => {
                if (result) console.log('[filter unit]', result);
              });
            }
          });
      } else {
        const reason = 'feature not enabled ';
        pool.refund(op, reason, result => {
          if (result) console.log('[filter]', result);
        });
      }
    } else {
      const reason = 'character doesnt exist ';
      pool.refund(op, reason, result => {
        if (result) console.log('[filter]', result);
      });
    }
  });
};

const filter = tx => {
  tx.operations.forEach(op => {
    const [type, payload] = op;

    switch (type) {
      case 'custom_json': {
        let json = {};
        try {
          json = JSON.parse(payload.json);
        } catch (e) {
          // console.log('Failed to parse custom_json json field', e);
        }

        switch (payload.id) {
          case 'dw-attack': {
            handleAttack(json, tx);
            break;
          }
          case 'dw-char': {
            handleChar(json, tx);
            break;
          }
          case 'dw-upgrade': {
            handleUpgrade(json, tx);
            break;
          }
          case 'dw-unit': {
            handleUnit(json, tx);
            break;
          }
          case 'dw-heist': {
            handleHeist(json, tx);
            break;
          }
          default: {
            break;
          }
        }

        break;
      }
      case 'transfer': {
        if (payload.to === 'drugwars-dealer') {
          handleTransfer(payload);
        }
        break;
      }
      default: {
        break;
      }
    }
  });
};

module.exports = {
  filter,
};
