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

const adModel = module.exports = mongoose.model('adModel', AdModelSchema);