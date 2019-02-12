const fetch = require('node-fetch');

function costToSteem(int, cb) {
  fetch('https://api.coinmarketcap.com/v1/ticker/steem/')
    .then(res =>
      res.json().then(result => {
        const price = parseFloat(int / 10000 / result[0].price_usd).toFixed(3);
        cb(price);
      }),
    )
    .catch(err => {
      console.log('[utils] Error: API not responding!', err);
      cb(null);
    });
}

function ifCanBuy(user, dCost, wCost, aCost) {
  return (
    dCost < user.drugs_balance && wCost < user.weapons_balance && aCost < user.alcohols_balance
  );
}

module.exports = {
  costToSteem,
  ifCanBuy,
};
