const express = require('express');
const Promise = require('bluebird');
const bcOperation = require('./helpers/filteroperation');
const attack = require('./src/attack_handler');
const client = require('./helpers/client');
const redis = require('./helpers/redis');

const app = express();
const port = process.env.PORT || 4000;
const server = app.listen(port, () => console.log(`Listening on ${port}`));

/** Work to do before streaming the chain */
const init = () =>
  new Promise((resolve, reject) => {
    client.blockchain
      .getCurrentBlockNum()
      .then(blockNum => {
        console.log('Current block num', blockNum);
        attack.loadAttacks(blockNum);
        resolve();
      })
      .catch(err => {
        console.log(err);
        reject();
      });
  });
var blck;
/** Work to do at each new irreversible block */
const work = (block, blockNum) =>
  new Promise((resolve, reject) => {
    console.log('Work at block', blockNum);
    if (block.transactions && block.transactions.length > 0) {
      block.transactions.forEach(tx => {
        if (blck != blockNum) {
          blck = blockNum
          attack.checkAttacks(tx, function (result) {
            if (result) {
              console.log('checked attacks')
            }
          });
        }

        bcOperation.filter(tx);
        resolve();
      });
    } else {
      resolve();
    }
  });

let lastBlockNum = 0;
const stream = setInterval(() => {
  client.database.getDynamicGlobalProperties().then(props => {
    // lastBlockNum = parseInt(props.last_irreversible_block_num);
    lastBlockNum = parseInt(props.head_block_number);
  });
}, 3000);

const handleBlock = blockNum => {
  if (lastBlockNum >= blockNum) {
    client.database
      .getBlock(blockNum)
      .then(block => {
        work(block, blockNum).then(() => {
          redis
            .setAsync('block_height', blockNum)
            .then(() => {
              console.log(`New block height is ${blockNum} ${block.timestamp}`);
              handleBlock(blockNum + 1);
            })
            .catch(err => {
              console.error("Failed to set 'block_height' on Redis", err);
              handleBlock(blockNum);
            });
        });
      })
      .catch(err => {
        console.error(`Request 'getBlock' failed at block num: ${blockNum}, retry`, err);
        handleBlock(blockNum);
      });
  } else {
    Promise.delay(100).then(() => {
      handleBlock(blockNum);
    });
  }
};

const start = () => {
  init().then(() => {
    redis
      .getAsync('block_height')
      .then(blockHeight => {
        console.log(`Last loaded block was ${blockHeight}`);
        const nextBlockNum = blockHeight ? parseInt(blockHeight) + 1 : 1;
        handleBlock(nextBlockNum);
      })
      .catch(err => {
        console.error("Failed to get 'block_height' on Redis", err);
      });
  });
};

start();
