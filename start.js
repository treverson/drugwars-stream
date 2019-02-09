const express = require('express');

const app = express();
const port = process.env.PORT || 4000;
const bc_operation = require('./helpers/filteroperation');
const attack = require('./src/attack_handler');
const { Client, BlockchainMode } = require('dsteem');

const client = new Client('https://api.steemit.com');

app.listen(port, () => console.log(`Listening on ${port}`));

const stream = client.blockchain.getBlockStream({ mode: BlockchainMode.Latest });

client.blockchain
  .getCurrentBlockNum()
  .then(res => {
    console.log(res)
    attack.loadAttacks(res);
  })
  .catch(err => {
    console.log(err);
  });

// stream
//   .on('data', block => {
//     if (block != null) {
//       try {
//         var object = JSON.stringify(block.transactions);
//         object.replace('\\', '');
//         object = JSON.parse(object);
//       } catch (error) {
//         console.log(error);
//       }
//       for (i = 0; i < object.length; i++) {

//         var bloc 
//         if(bloc!=object[i].block_num)
//         {
//           console.log(object[i].block_num)
//           bloc = object[i].block_num
//           attack.checkAttacks(object[i]);
//         }

//         bc_operation.filter(object[i]);
//       }
//     }
//   })
//   .on('end', () => {
//     // done
//     console.log('END');
//   });
