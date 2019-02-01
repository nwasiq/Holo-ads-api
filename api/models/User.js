'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// var adModel = mongoose.model('adModel').schema;

var UserSchema = new Schema({

    email: String,
    gender: [String],
    location:{
        latitude: Number,
        longitude: Number
    },
    age: [Number],
    interests: [String]
});

const user = module.exports = mongoose.model('user', UserSchema);

module.exports.getUserById = function (id, callback) {
    user.findById(id, callback);
}

module.exports.getUserByEmail = function (email, callback) {
    const query = {
        email: email
    };

    user.findOne(query, callback);
}