
const helpers = {
    CreateAttributes: function (id) {
        var query = "";
        for (i = 1; i < 11; i++) {
            query += "(" + id + "," + [i] + "," + getRandomInt(12) + ")"
            query = query.replace(')(', '),(')
        }
        query = query.replace(')(', '),(')
        return query
    },
    createUniqueId:function () {
        var id = new Date().valueOf();
        return id
    }
}
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

module.exports = helpers;