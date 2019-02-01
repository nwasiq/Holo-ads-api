'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdvertiserSchema = new Schema({

    name: String,
    password: String,
    ads:[
        { type: Schema.Types.ObjectId, ref: 'ad' }
    ]
});

const advertiser = module.exports = mongoose.model('advertiser', AdvertiserSchema);

module.exports.getAdvertiserById = function (id, callback) {
    advertiser.findById(id, callback);
}

module.exports.getAdvertiserByName = function (name, callback) {
    const query = {
        name: name
    };

    advertiser.findOne(query, callback);
}