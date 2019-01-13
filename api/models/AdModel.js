'use strict';

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var AdModelSchema = new schema({
    adLink: String,
    adType: String
});

const adModel = module.exports = mongoose.model('adModel', AdModelSchema);