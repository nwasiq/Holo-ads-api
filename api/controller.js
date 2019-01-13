'use strict';

const AdModel = require('./models/AdModel');
const Brand = require('./models/Brand');
const fs = require('fs');
const path = require('path');
const fileUpload = require('../utils/fileUpload');
const config = require('../config/database');
const baseURL = "http://localhost:3000";
const jwt = require('jsonwebtoken');
const serverAdsPath = './public/ads/';


exports.getAds = function (req, res) {
    Brand.findOne(req.user._id)
        .populate('ads')
        .exec(function (err, brand) {
            if (err) throw err;
            if (brand.ads.length == 0) {
                res.json({
                    success: false,
                    msg: "No ads found"
                });
                return;
            }
            res.json({
                success: true,
                ads: brand.ads
            });
        });
}

exports.deleteAds = function (req, res) {
    Brand.findOne(req.user._id, function (err, brand) {
        if (err) throw err;

        var fileDeleted = false;

        fs.readdir(serverAdsPath, (err, files) => {
            if (err) throw err;

            for (const file of files) {

                if (file.toString().indexOf(req.user.name.toString()) != -1){
                    fileDeleted = true;
                    fs.unlink(path.join(serverAdsPath, file), err => {
                        if (err) throw err;
                    });
                }
            }

            if(!fileDeleted){
                res.json({
                    success: false,
                    msg: "No ads found for brand: " + brand.name
                })
                return;
            }

            AdModel.deleteMany({ _id: { $in: brand.ads}}, (err, ads) => {
                if(err) throw err;
                brand.ads = [];
                brand.save(function (err) {
                    if (err) throw err;
                    res.json({
                        success: true,
                        msg: "Ads cleared"
                    });
                })
            });
        });
    });
}

exports.uploadAd = function (req, res) {
    fileUpload.uploadAd(req, res, (err) => {
        const adType = req.body.adType;
        if (err) {
            res.json({
                success: false,
                msg: "upload failed",
                err: err
            });
        }
        else {
            if (req.file == undefined) {
                res.json({
                    success: false,
                    msg: "no file selected"
                });
            } else {
                Brand.findOne(req.user._id, function (err, brand) {
                    var adLink = baseURL + `/ads/${req.file.filename}`;
                    var advert = new AdModel ({
                        adLink: adLink,
                        adType: adType,
                    });

                    advert.save((err, ad) => {
                        if(err) throw err;

                        brand.ads.push(ad._id);
                        brand.save((err, brand) => {
                            if (err) throw err;
                            res.json({
                                success: true,
                                brand: brand.name,
                                ad: ad.adLink
                            })
                        });
                    })
                });
            }
        }

    });
}

exports.getAllAds = function (req, res) {
    AdModel.find({}, function (err, ads) {
        if (err) throw err;
        if (ads.length == 0) {
            res.json({
                success: false,
                msg: "No ads found"
            })
            return;
        }
        res.json({
            success: true,
            ads: ads
        })
    })
}

// exports.deleteAllAds = function (req, res) {
//     AdsDb.remove({}, function (err, ads) {
//         if (err) throw err;
//         res.json({
//             success: true,
//             msg: "All ads removed"
//         })
//     })
// }

exports.login = function (req, res) {
    var username = req.body.name;
    var password = req.body.password;
    Brand.getBrandByName(username, (err, brand) => {
        if (err) throw err;
        if (!brand) {
            res.json({ success: false, msg: 'Brand not found' });
            return;

        }

        var isMatch;

        if (password == brand.password)
            isMatch = true;
        else
            isMatch = false;

        if (isMatch) {
            const token = jwt.sign(brand.toJSON(), config.secret, {
                expiresIn: 604800 // 1 week
            });

            res.json({
                success: true,
                token: 'Bearer ' + token,
                brand: brand
            });

        }
        else {
            res.json({ success: false, msg: 'Wrong password' });
        }
    })
}

exports.register = function (req, res) {
    var newBrand = new Brand(req.body);
    var username = req.body.name;

    newBrand.adCounter = 0;

    Brand.getBrandByName(username, function (err, brand) {
        if (err) throw err;
        if (brand) {
            res.json({
                success: false,
                msg: "this brand is already registered"
            })
            return;
        }

        newBrand.save(function (err, brand) {


            if (err) {
                res.json({
                    success: false,
                    msg: "failed",
                    error: err
                });
            }
            else {
                const token = jwt.sign(brand.toJSON(), config.secret, {
                    expiresIn: 604800 // 1 week
                });
                res.json({
                    success: true,
                    token: 'Bearer ' + token,
                    brand: brand
                });
            }
        });
    });

}


