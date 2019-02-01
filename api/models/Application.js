'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// var adModel = mongoose.model('adModel').schema;

var AppSchema = new Schema({

    appName: String,
    interests: [String],
    demographic: {
        gender: [String],
        age: [Number],
    }
});

const app = module.exports = mongoose.model('app', AppSchema);

module.exports.getAppByDevName = function (name, callback) {
    const query = {
        devUserName: name
    };

    app.findOne(query, callback);
}