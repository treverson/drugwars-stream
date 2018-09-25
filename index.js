
app.use(serve('/'));

const server = app.listen(5000);

console.log('listening on port 5000');

const dsteem = require('dsteem');

let opts = {};

//connect to production server
opts.addressPrefix = 'STM';
opts.chainId =
    '0000000000000000000000000000000000000000000000000000000000000000';

//connect to server which is connected to the network/production
const client = new dsteem.Client('https://api.steemit.com');

let stream;
let state;
let blocks = [];
//start stream
async function main() {
    stream = client.blockchain.getBlockStream();
    stream
        .on('data', function(block) {
            //console.log(block);
            blocks.unshift(
                console.log(`Block id: ${block.block_id} ${block.transactions.length} ${block.witness} ${block.timestamp}`)
                )
                })
        .on('end', function() {
            // done
            console.log('END');
        });
}