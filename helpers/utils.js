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
      console.log('Error: API not responding!', err);
      cb(null);
    });
}


function ifCanBuy(user, d_cost,w_cost,a_cost) {
    if (d_cost < user.drugs_balance && w_cost < user.weapons_balance && a_cost < user.alcohols_balance) {
      return true
    }
    else {
      return false
    }
}

module.exports = {
  costToSteem,ifCanBuy
};
