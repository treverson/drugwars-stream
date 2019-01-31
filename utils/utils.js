var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const utils = {
    costToSteem: function (int) {
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
                        var price=(int/10000)*ticker[0].price_usd
                        console.log(price)
                        return(price)
                    }
                } else {
                    console.log("Error: API not responding!");
                    return(null)
                }
            }
        }
    }
}
module.exports = utils;