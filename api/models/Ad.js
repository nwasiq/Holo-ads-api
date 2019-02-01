'use strict';

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var AdSchema = new schema({
    adName: String,
    adDescription: String,
    adLink: String,
    adType: String,
    adExternalLink: String,
    demographic: {
        gender: [String],
        //need optimization by managing foreign location relation
        location: [{
            //must match with user
            latitude: String,
            longitude: String
        }],
        age: [Number],

    },
    interests: [String]
});

const ad = module.exports = mongoose.model('ad', AdSchema);