const { PrivateKey } = require('dsteem');
const client = require('../helpers/client');

const send = (op, cb) => {
  let amount = op.amount.split(' ')[0];
  amount = (amount / 100) * 80;
  amount = parseFloat(amount).toFixed(3);
  const transfer = amount.concat(' ', 'STEEM');
  const transf = {};
  transf.from = 'drugwars-dealer';
  transf.to = 'drugwars';
  transf.amount = transfer;
  transf.memo = 'Pool contribution';
  client.broadcast.transfer(transf, PrivateKey.fromString(process.env.DW_DEALER_KEY)).then(
    result => {
      console.log(`sent:${transfer}`, `to pool included in block: ${result.block_num}`);
      cb(true);
    },
    error => {
      console.error(error);
      cb(null);
    },
  );
};

const refund = (op, reason, cb) => {
  let amount = op.amount.split(' ')[0];
  amount = parseFloat(amount).toFixed(3);
  const transfer = amount.concat(' ', 'STEEM');
  const transf = {};
  transf.from = 'drugwars-dealer';
  transf.to = op.from;
  transf.amount = transfer;
  transf.memo = `DrugWars Refund : ${reason}`;
  client.broadcast.transfer(transf, PrivateKey.fromString(process.env.DW_DEALER_KEY)).then(
    result => {
      console.log(`refund for ${reason}${transfer}`, `included in block: ${result.block_num}`);
      cb(true);
    },
    error => {
      console.error(error);
      cb(null);
    },
  );
};

module.exports = {
  send,
  refund,
};
