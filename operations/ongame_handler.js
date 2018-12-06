var mysql = require('mysql');

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
        ON DUPLICATE KEY UPDATE  title='${content.title}', body='${content.body}', json_metadata='${content.json_metadata}',game='${content.game}', last_update='${content.last_update}', type='${content.type}'`
        pool.getConnection(function (error, connection) {
            connection.query(query, function (err, result) {
                if (err) {
                    console.log(err)
                    cb(err);
                    connection.release();
                }
                else
                    console.log('ongame content inserted')
                connection.release();
                cb(null)
            })
        })
    },
    parseContent: function (post) {
        var content = {}
        content.author = post.author
        content.permlink = post.permlink
        content.title = post.title.toString().replace(/\'/g, "''")
        content.body = post.body.toString().replace(/\'/g, "''")
        var today = new Date()
        var dd = today.getUTCDate();
        var mm = today.getUTCMonth() + 1;
        var yyyy = today.getUTCFullYear();
        var hhhh = today.getUTCHours()
        var mmmm = today.getUTCMinutes()
        var ssss = today.getUTCSeconds()
        today = yyyy + '/' + mm + '/' + dd;
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }
        today = yyyy + '/' + mm + '/' + dd + ' ' + hhhh + ':' + mmmm + ':' + ssss;
        content.created = today
        content.last_update = today
        content.tags = post.json_metadata.tags
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
            content.json_metadata = JSON.stringify(post.json_metadata).toString().replace(/\'/g, "''")
        } catch (e) {
            console.log(e)
        }

        return content;
    }
}
module.exports = ongame_handler;


// var query = `INSERT INTO projects (author,permlink,category,parent_author, parent_permlink, 
//     title, body, json_metadata, last_update, created, active, last_payout, depth, 
//     children, net_rshares, abs_rshares, vote_rshares, children_abs_rshares, cashout_time, max_cashout_time, 
//     total_vote_weight, reward_weight, total_payout_value,curator_payout_value, author_rewards, net_votes, root_comment, 
//     mode, max_accepted_payout,percent_steem_dollars, allow_replies, allow_votes, allow_curation_rewards, beneficiaries,url, 
//     root_title, pending_payout_value, total_pending_payout_value, active_votes,replies, author_reputation, promoted, body_length, 
//     reblogged_by, body_language, tags ) 
// VALUES
// ('${post.author}','${post.permlink}','${post.category}','${post.parent_author}','${post.parent_permlink}',
// '${post.title}','${post.body}','${post.json_metadata}','${post.last_update}','${post.created}','${post.active}','${post.last_payout}',
// '${post.depth}','${post.children}','${post.net_rshares}','${post.abs_rshares}','${post.vote_rshares}','${post.children_abs_rshares}',
// '${post.cashout_time}','${post.max_cashout_time}','${post.total_vote_weight}','${post.reward_weight}','${post.total_payout_value}',
// '${post.curator_payout_value}','${post.author_rewards}','${post.net_votes}','${post.root_comment}','${post.mode}','${post.max_accepted_payout}',
// '${post.percent_steem_dollars}','${post.allow_replies}','${post.allow_votes}','${post.allow_curation_rewards}','${post.beneficiaries}',
// '${post.url}','${post.root_title}','${post.pending_payout_value}','${post.total_pending_payout_value}','${post.active_votes}',
// '${post.replies}','${post.author_reputation}','${post.promoted}','${post.body_length}','${post.reblogged_by}','${post.body_language}',
// '${post.tags}')
// ON DUPLICATE KEY UPDATE  
// title='${post.title}', body='${post.body}', json_metadata='${post.json_metadata}', 
// last_update='${post.last_update}', last_payout='${post.last_payout}',active='${post.active}',
// cashout_time='${post.max_cashout_time}', total_payout_value='${post.total_payout_value}' ,curator_payout_value='${post.curator_payout_value}' 
// ,author_rewards='${post.author_rewards}' ,net_votes='${post.net_votes}' ,pending_payout_value='${post.pending_payout_value}'
// ,total_pending_payout_value='${post.total_pending_payout_value}' ,active_votes='${post.active_votes}',tags='${post.tags}'`