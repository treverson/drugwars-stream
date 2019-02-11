const Promise = require('bluebird');
const db = require('../helpers/db');
const bcOperation = require('../helpers/filteroperation');
const { resolveBattle } = require('./attack_handler');

/** Work to do before streaming the chain */
const init = () => new Promise((resolve, reject) => {
  console.log('[init] Nothing to init');
  resolve();
});

/** Work to do at each new irreversible block */
const work = (block, blockNum) => new Promise((resolve, reject) => {
  console.log('[work] Work at block', blockNum);
  const promises = [];

  /** Work to do for each blocks */
  let query = 'SELECT * FROM battles WHERE target_block <= ? ORDER BY target_block ASC LIMIT 1';
  db.queryAsync(query, [blockNum]).then(attacks => {

    if (attacks.length > 0) {
      attacks.forEach(attack => {
        promises.push(resolveBattle(attack));
      });
    }

    /** Work to do for each tx */
    if (block.transactions && block.transactions.length > 0) {
      block.transactions.forEach(tx => {
        bcOperation.filter(tx); // @TODO make a promise
      });
    }

    /** Resolve all promises in serie */
    if (promises.length > 0) {
      Promise.each(promises, (p) => p).then(() =>{
        console.log('[work] Work done on', promises.length, blockNum);
        resolve();
      }).catch((e) => {
        console.log('[work] Promises failed', e);
        reject();
      });
    } else {
      console.log('[work] No work async to do');
      resolve();
    }
  });
});

module.exports = {
  init,
  work,
};
