var mysql = require('mysql');
var steem = require('steem');

var pool = mysql.createPool({
    connectionLimit: 5,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});

const ongame_handler = {
    insertItem: function (content, cb) {
        var query = `INSERT INTO ongamecontents (author,permlink,title, created, body, json_metadata, game, last_update, type ) 
        VALUES ('${content.author}','${content.permlink}','${content.title}','${content.created}','${content.body}', '${content.json_metadata}','${content.game}','${content.last_update}','${content.type}')
        ON DUPLICATE KEY UPDATE  title='${content.title}', created='${content.created}', body='${content.body}', json_metadata='${content.json_metadata}',game='${content.game}', last_update='${content.last_update}', type='${content.type}'`
        pool.getConnection(function (error, connection) {
            connection.query(query, function (err, result) {
                if (err) {
                    console.log(err)
                    cb(err);
                    connection.release();
                }
                else
                    console.log('ongame content inserted')
                cb(null)
                connection.release();
            })
        })
    },
    parseContent: function (post) {
        var content = {}
        console.log(post)
        if (!content) content = {}
        content.author = post.author
        content.permlink = post.permlink
        content.title = post.title.toString().replace(/\'/g, "''")
        content.created = post.created
        content.body = post.body.toString().replace(/\'/g, "''")
        content.created = post.created
        content.last_update = post.last_update
        content.tags = content.json_metadata.tags
        for (i = 0; content.tags.length > i; i++) {
            if (content.tags[i].includes('ongame-news') || content.tags[i].includes('ongame-streaming') || content.tags[i].includes('ongame-video') 
            || content.tags[i].includes('ongame-screenshot') || content.tags[i].includes('ongame-review') || content.tags[i].includes('ongame-tips')  ) {
                content.type = content.tags[i].split('-')[1]
            }
            else if (content.tags[i].includes('ongame-')){
                content.game = content.tags[i].split('-')[1]
            }
        }
        try {
            content.json_metadata = JSON.stringify(content.json_metadata).toString().replace(/\'/g, "''")
        } catch (e) {
            console.log(e)
        }

        return content;
    }
}
module.exports = ongame_handler;