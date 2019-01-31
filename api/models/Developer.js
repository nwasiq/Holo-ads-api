'use strict';

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var DeveloperSchema = new schema({
    username: String,
    password: String,
    email: String,
    apps: [
        { type: schema.Types.ObjectId, ref: 'app' }
    ]
});

const dev = module.exports = mongoose.model('developer', DeveloperSchema);

module.exports.getDevByEmail = function (email, callback) {
    const query = {
        email: email
    };

    dev.findOne(query, callback);
}