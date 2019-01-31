const { Client, BlockchainMode, PrivateKey } = require('dsteem');
var client = new Client('https://api.steemit.com')

var db = require('../lib/db');

const pool_handler = {
    send: function (op, cb) {
        var amount = op.amount.split(' ')[0]
        amount = (amount / 100) * 89
        amount = parseFloat(amount).toFixed(3)
        const transfer = amount.concat(' ', 'STEEM');
        const transf = new Object();
        transf.from = 'drugwars-dealer';
        transf.to = 'drugwars';
        transf.amount = transfer;
        transf.memo = 'Pool contribution';
        client.broadcast.transfer(transf, PrivateKey.fromString(process.env.DW_DEALER_KEY)).then(
            function (result) {
                console.log(
                    'sent:' + transfer,
                    'included in block: ' + result.block_num,
                );
                cb(true)
            },
            function (error) {
                console.error(error);
                cb(null)
            }
        )
    }
}
module.exports = pool_handler;