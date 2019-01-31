var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const utils = {
    costToSteem: function (int,cb) {
        var xtr = new XMLHttpRequest();
        xtr.open('GET', 'https://api.coinmarketcap.com/v1/ticker/steem/', true);
        xtr.send();
        xtr.onreadystatechange = function () {
            if (xtr.readyState == 4) {
                if (xtr.status == 200) {
                    if (xtr.responseText) {
                        try {
                            var ticker = JSON.parse(xtr.responseText)
                        }
                        catch (e) {

                        }
                        var price=parseFloat((int/10000)/ticker[0].price_usd).toFixed(3)
                        cb(price)
                    }
                } else {
                    console.log("Error: API not responding!");
                    cb(null)
                }
            }
        }
    }
}
module.exports = utils;