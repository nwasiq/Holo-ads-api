'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// var adModel = mongoose.model('adModel').schema;

var BrandSchema = new Schema({

    name: String,
    password: String,
    ads:[
        { type: Schema.Types.ObjectId, ref: 'adModel' }
    ]
});

const brand = module.exports = mongoose.model('brand', BrandSchema);

module.exports.getBrandById = function (id, callback) {
    brand.findById(id, callback);
}

module.exports.getBrandByName = function (name, callback) {
    const query = {
        name: name
    };

    brand.findOne(query, callback);
}