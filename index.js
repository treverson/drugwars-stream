var dsteem = require('dsteem')
var mysql = require('mysql');
const express = require('express')
var es = require('event-stream')
var util = require('util')
const app = express()
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on ${port}`));
console.log('listening on port 5000');

console.log(process.env.JAWSDB_URL)

var client = new dsteem.Client('https://api.steemit.com')

var stream = client.blockchain.getBlockStream()

stream.on('data', function (block) {
    if (block.transactions[0] != undefined) {
        var object = JSON.stringify(block.transactions)
        object.replace('\\', '')
        object = JSON.parse(object)
        for (i = 0; i < object.length; i++) {
            var operation = object[i].operations
            if (operation[0][0] === 'transfer') {
                if (operation[0][1].from === "hightouch" || operation[0][1].to === "hightouch") {
                    console.log('block ' + block.block_id)
                    ongametransaction = operation[0][1]
                    console.log('Ongame Transaction For a Character')
                    console.log(ongametransaction)
                }
            }
        }

        // if(object[0].operations)
        // {
        //     var type = object[0].operations[0][0]
        //     if(type === 'transfer')
        //     {
        //         console.log('transfer')
        //         console.log(object[0].operations[0][0])
        //     }

        //     if(object[1].operations[0][0])
        //     {
        //         var type2 = object[1].operations[0][0]
        //         if(type2 === 'transfer')
        //         {
        //             console.log('transfer2')
        //             console.log(object[1].operations[0][0])
        //         }
        //     }

        // }

    }
})
    .on('end', function () {
        // done
        console.log('END');
    });



var con = mysql.createConnection({
    host: "db4free.net",
    user: "ongame",
    password: "Abcdef55",
    database: "ongame"
});

con.connect(function (err) {
    if (err) throw err;
    var json = '{"skin": "none","hr_weapon": "none","hl_weapon": "none", "body": "none","bottom": "none","hat": "none"}'
    var id = getHash('hightouch')
    username = "hightouch"
    //var query = "INSERT INTO users (id, name, level, xp, inventory) VALUES ('"+id +"," +username +"','"+json+"') ON DUPLICATE KEY UPDATE id = id + 1"
    var query ="SELECT name FROM users"
    console.log("Connected!");
    var sql = "INSERT INTO users (name, inventory) VALUES ('hightouch','[name1]')";
    con.query(query, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        console.log(result)
        for (var i = 0; i < result.length; i++) {
        console.log(result[i].name)
        }
    });
});

function getHash(input){
    var hash = 0, len = input.length;
    for (var i = 0; i < len; i++) {
      hash  = ((hash << 5) - hash) + input.charCodeAt(i);
      hash |= 0; // to 32bit integer
    }
    return hash;
  }
  