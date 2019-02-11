const express = require('express');
const Promise = require('bluebird');
const client = require('./helpers/client');
const redis = require('./helpers/redis');
const { init, work } = require('./src');

const app = express();
const port = process.env.PORT || 4000;
const server = app.listen(port, () => console.log(`[start] Listening on ${port}`));

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
              console.log(`[start] New block height is ${blockNum} ${block.timestamp}`);
              handleBlock(blockNum + 1);
            })
            .catch(err => {
              console.error("[start] Failed to set 'block_height' on Redis", err);
              handleBlock(blockNum);
            });
        });
      })
      .catch(err => {
        console.error(`[start] Request 'getBlock' failed at block num: ${blockNum}, retry`, err);
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
        console.log(`[start] Last loaded block was ${blockHeight}`);
        const nextBlockNum = blockHeight ? parseInt(blockHeight) + 1 : 1;
        handleBlock(nextBlockNum);
      })
      .catch(err => {
        console.error("[start] Failed to get 'block_height' on Redis", err);
      });
  });
};

start();
