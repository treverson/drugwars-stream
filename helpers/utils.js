const fetch = require('node-fetch');
const fs = require('fs')
function costToSteem(int, cb) {
  fetch('https://api.coinmarketcap.com/v1/ticker/steem/')
    .then(res =>
      res.json().then(result => {
        const price = parseFloat(int / 10000 / result[0].price_usd).toFixed(3);
        console.log(price)
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

function readJson(path, cb){
  fs.readFile(require.resolve(path), (err, data) => {
    if (err)
    return cb(err)
    else
      return cb(JSON.parse(data))
  })
}

module.exports = {
  costToSteem,ifCanBuy,readJson
};
