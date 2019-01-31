'use strict';

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var AdModelSchema = new schema({
    adName: String,
    adDescription: String,
    adLink: String,
    adType: String,
    adExternalLink: String,
    demographic: {
        gender: String,
        location: [{
            //must match with user
            latitude: String,
            longitude: String
        }],
        age: {
            greaterThan: Number,
            lessThan: Number
        },

    },
    interests: [String]
});

const adModel = module.exports = mongoose.model('adModel', AdModelSchema);