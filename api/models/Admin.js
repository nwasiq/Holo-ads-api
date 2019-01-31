'use strict';

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var AdminSchema = new schema({
    username: String,
    password: String
});

const admin = module.exports = mongoose.model('admin', AdminSchema);